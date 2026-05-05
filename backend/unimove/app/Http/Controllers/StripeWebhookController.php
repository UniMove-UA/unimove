<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;
use Illuminate\Support\Facades\Log;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret    = config('services.stripe.webhook_secret') ?? env('STRIPE_WEBHOOK_SECRET');

        if (empty($secret)) {
            Log::warning('Stripe webhook secret not configured');
            return response('Webhook secret not configured', 500);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (SignatureVerificationException $e) {
            Log::warning('Stripe signature verification failed: ' . $e->getMessage());
            return response('Invalid signature', 400);
        } catch (\Exception $e) {
            Log::error('Stripe webhook error: ' . $e->getMessage());
            return response('Webhook processing error', 500);
        }

        try {
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $piId = $event->data->object->id ?? null;
                    Log::info('Pago exitoso: ' . ($piId ?? 'unknown'));

                    if ($piId) {
                        $metadata = $event->data->object->metadata ?? [];
                        DB::beginTransaction();
                        $payment =Payment::updateOrCreate(
                            ['payment_intent_id' => $piId],
                            [
                                'status' => 'succeeded',
                                'amount' => $event->data->object->amount ?? null,
                                'currency' => $event->data->object->currency ?? null,
                                'metadata' => $metadata,
                            ]
                        );
                        if ($payment->booking_id) {
                            $payment->booking()->update(['status' => 'confirmed']);
                        }

                        DB::commit();
                    }
                    break;

                case 'payment_intent.payment_failed':
                    $piId = $event->data->object->id ?? null;
                    Log::info('Pago fallido: ' . ($piId ?? 'unknown'));
                    if ($piId) {
                        DB::beginTransaction();
                        $payment =Payment::updateOrCreate(
                            ['payment_intent_id' => $piId],
                            ['status' => 'failed']
                        );

                        if ($payment->booking_id) {
                            $payment->booking()->update(['status' => 'cancelled']);
                            $payment->booking->travel()->increment('available_seats');
                        }
                        DB::commit();
                    }
                    break;
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing webhook event: ' . $e->getMessage());
            return response('Webhook processing error', 500);
        }

        return response('OK', 200);
    }
}
