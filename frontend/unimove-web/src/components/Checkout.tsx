import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // Use cookie-based session auth (Sanctum). No local test token needed.
  const [cardBrand, setCardBrand] = useState<string>('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const token = localStorage.getItem('auth_token');
    const resp = await fetch('/api/payments/create-intent', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json' ,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: 12.50, currency: 'eur' })
    })

    const data = await resp.json()
    console.log('create-intent response', resp.status, data)
    if (!resp.ok) {
      setStatus(data.error || 'Error creating payment')
      setLoading(false)
      return
    }

    const clientSecret = data.clientSecret
    console.log('clientSecret', clientSecret)
    if (!stripe || !elements) {
      setStatus('Stripe not loaded')
      setLoading(false)
      return
    }

    const card = elements.getElement(CardNumberElement)
    if (!card) {
      setStatus('Card element not ready')
      setLoading(false)
      return
    }

    const confirm = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name: 'Test User',
          address: { postal_code: '12345' }
        }
      }
    })

    console.log('confirmCardPayment result', confirm)

    if (confirm.error) {
      setStatus(confirm.error.message || 'Payment failed')
    } else if (confirm.paymentIntent && confirm.paymentIntent.status === 'succeeded') {
      setStatus('Payment succeeded')
    } else {
      setStatus('Payment processing')
    }

    setLoading(false)
  }

  // No test token helper: use session-based login in the app instead.

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Use the app login to obtain a session cookie (Sanctum). No test token button. */}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Card details</label>
        <div className="grid grid-cols-3 gap-2 border p-2 mb-4">
          <div className="col-span-2">
            <label className="text-xs">Número</label>
            <div className="mt-1"><CardNumberElement options={{placeholder: '4242 4242 4242 4242'}} onChange={(e)=>setCardBrand(e.brand || '')} /></div>
          </div>
          <div>
            <label className="text-xs">Exp</label>
            <div className="mt-1"><CardExpiryElement /></div>
          </div>
          <div className="col-span-1 mt-2">
            <label className="text-xs">CVC</label>
            <div className="mt-1"><CardCvcElement options={{placeholder: 'CVC'}} /></div>
            <p className="text-xs text-gray-500 mt-1">{cardBrand === 'amex' ? 'CVC: 4 dígitos (AMEX)' : 'CVC: 3 dígitos'}</p>
          </div>
        </div>
        <button style={{ backgroundColor: '#0ea5a6', color: '#000' }} className="px-4 py-2 rounded" disabled={loading || !stripe}>
          {loading ? 'Paying…' : 'Pay 12.50€'}
        </button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  )
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
