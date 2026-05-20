<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Vmp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class PaymentController extends Controller
{
    /**
     * Create a Stripe PaymentIntent and return client_secret.
     * Expected input: { bookingId: int }
     */
    public function createIntent(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'bookingId' => 'nullable|integer',
            'amount' => 'nullable|numeric',
            'currency' => 'nullable|string',
            'type' => 'nullable|string', // carpool or vmp
            'id' => 'nullable|integer',
        ]);

        $currency = $data['currency'] ?? 'eur';

        $amountCents = null;

        if (!empty($data['bookingId'])) {
            $booking = Booking::find($data['bookingId']);
            if (!$booking) {
                return response()->json(['error' => 'Booking not found'], 404);
            }
            // ensure the authenticated user is the passenger (simple authorization)
            if ($booking->passenger_id !== $user->id) {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            // travel price expected in main currency (e.g. euros)
            $price = $booking->travel->price ?? null;
            if ($price === null) {
                return response()->json(['error' => 'Booking has no price configured'], 400);
            }
            $priceToCharge = max(0.50, floatval($price));
            $amountCents = (int) round($priceToCharge * 100);
            $metadata = ['booking_id' => $booking->id];
            $idempotencyKey = 'pi_booking_' . $booking->id . '_' . uniqid();
        } elseif (!empty($data['amount'])) {
            $amountCents = (int) round(floatval($data['amount']) * 100);
            $metadata = [];
            // Use a per-request unique idempotency key for manual payments to
            // avoid "same key different params" errors during local testing.
            $idempotencyKey = 'pi_manual_' . ($user->id ?? 'anon') . '_' . uniqid();
        } elseif (!empty($data['type']) && !empty($data['id'])) {
            $type = $data['type'];
            $entityId = $data['id'];
            $metadata = [];
            if ($type === 'carpool') {
                $booking = Booking::find($entityId);
                if (!$booking) return response()->json(['error' => 'Booking not found'], 404);
                if ($booking->passenger_id !== $user->id) return response()->json(['error' => 'Forbidden'], 403);
                $price = $booking->travel->price ?? null;
                if ($price === null) return response()->json(['error' => 'Booking has no price configured'], 400);
                $priceToCharge = max(0.50, floatval($price));
                $amountCents = (int) round($priceToCharge * 100);
                $metadata = ['booking_id' => $booking->id, 'travel_id'  => $booking->travel_id,];
                $idempotencyKey = 'pi_booking_' . $booking->id . '_' . uniqid();
            } elseif ($type === 'vmp') {
                $vmp = Vmp::find($entityId);
                if (!$vmp) return response()->json(['error' => 'VMP not found'], 404);
                // Use unlock_price if available, otherwise fall back to price_per_minute
                $unlock = $vmp->unlock_price ?? $vmp->price_per_minute ?? 0.50;
                // Stripe minimum charge in EUR is 0.50, enforce a floor
                $unlock = max(0.50, floatval($unlock));
                $amountCents = (int) round(floatval($unlock) * 100);
                $metadata = ['vmp_id' => $vmp->id];
                $idempotencyKey = 'pi_vmp_' . $vmp->id . '_' . uniqid();
            } else {
                return response()->json(['error' => 'Unknown payment type'], 400);
            }
        } else {
            return response()->json(['error' => 'No amount or bookingId provided'], 400);
        }

        if ($amountCents <= 0) {
            return response()->json(['error' => 'Invalid amount'], 400);
        }

        $secret = config('services.stripe.secret') ?? env('STRIPE_SECRET');
        if (empty($secret)) {
            Log::error('Stripe secret key not configured');
            return response()->json(['error' => 'Payment gateway not configured'], 500);
        }

        Stripe::setApiKey($secret);

        try {
            // For this application we only simulate card payments and never
            // handle redirect-based payment methods. To avoid requiring a
            // return_url on confirmation, disable redirects and restrict to cards.
            $pi = PaymentIntent::create([
                'amount' => $amountCents,
                'currency' => $currency,
                'automatic_payment_methods' => [
                    'enabled' => true,
                    'allow_redirects' => 'never',
                ],
                'metadata' => $metadata ?? [],
            ], [
                'idempotency_key' => $idempotencyKey,
            ]);

            // Persist payment record (idempotent)
            try {
                DB::beginTransaction();
                $bookingId = isset($booking) ? ($booking->id ?? null) : null;

                $paymentAttrs = [
                    'payment_intent_id' => $pi->id,
                    'booking_id' => $bookingId,
                    'user_id' => $user->id,
                    'amount' => $amountCents,
                    'currency' => $currency,
                    'status' => $pi->status ?? 'pending',
                    'metadata' => $metadata ?? [],
                ];

                // Use updateOrCreate keyed by payment_intent_id to be idempotent
                $payment = Payment::updateOrCreate(
                    ['payment_intent_id' => $pi->id],
                    $paymentAttrs
                );

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Could not persist payment record: ' . $e->getMessage());
            }

            return response()->json(['clientSecret' => $pi->client_secret, 'payment_intent_id' => $pi->id]);
        } catch (\Exception $e) {
            Log::error('Stripe create intent error: ' . $e->getMessage());
            return response()->json(['error' => 'Could not create payment intent'], 500);
        }
    }

    /**
     * List authenticated user's VMP payments.
     * Used by the frontend to render "Mis QR" in the profile.
     */
    public function myVmpPayments(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $payments = Payment::query()
            ->where('user_id', $user->id)
            ->whereNotNull('metadata->vmp_id')
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        $vmpIds = $payments
            ->map(fn($p) => $p->metadata['vmp_id'] ?? null)
            ->filter(fn($id) => !empty($id))
            ->unique()
            ->values();

        $vmps = Vmp::query()
            ->whereIn('id', $vmpIds)
            ->get()
            ->keyBy('id');

        $items = $payments->map(function ($p) use ($vmps) {
            $vmpId = $p->metadata['vmp_id'] ?? null;
            $vmpIdInt = $vmpId !== null ? (int) $vmpId : null;
            $vmp = $vmpIdInt !== null ? $vmps->get($vmpIdInt) : null;

            $title = null;
            if ($vmp) {
                $title = $vmp->location_name ?: ($vmp->code ?: ('VMP #' . $vmp->id));
            } elseif ($vmpIdInt !== null) {
                $title = 'VMP #' . $vmpIdInt;
            }

            return [
                'id' => $p->id,
                'payment_intent_id' => $p->payment_intent_id,
                'status' => $p->status,
                'created_at' => optional($p->created_at)->toISOString(),
                'vmp_id' => $vmpIdInt,
                'title' => $title,
                'qr_value' => $vmpIdInt !== null ? (string) $vmpIdInt : null,
                'vmp' => $vmp ? [
                    'id' => $vmp->id,
                    'code' => $vmp->code,
                    'location_name' => $vmp->location_name,
                    'type' => $vmp->type ?? 'scooter',
                ] : null,
            ];
        });

        return response()->json($items);
    }
}
