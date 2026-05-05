import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasToken, setHasToken] = useState<boolean>(() => !!localStorage.getItem('auth_token'))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    // Read token from localStorage (set by your app authentication)
    const token = localStorage.getItem('auth_token') || ''

    // Ask backend to create a PaymentIntent
    const resp = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ amount: 12.50, currency: 'eur' })
    })

    const data = await resp.json()
    if (!resp.ok) {
      setStatus(data.error || 'Error creating payment')
      setLoading(false)
      return
    }

    const clientSecret = data.clientSecret
    if (!stripe || !elements) {
      setStatus('Stripe not loaded')
      setLoading(false)
      return
    }

    const card = elements.getElement(CardElement)
    if (!card) {
      setStatus('Card element not ready')
      setLoading(false)
      return
    }

    const confirm = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    })

    if (confirm.error) {
      setStatus(confirm.error.message || 'Payment failed')
    } else if (confirm.paymentIntent && confirm.paymentIntent.status === 'succeeded') {
      setStatus('Payment succeeded')
    } else {
      setStatus('Payment processing')
    }

    setLoading(false)
  }

  function useTestToken() {
    // example test token (use your real dev token if you have one)
    const testToken = '1|q8zBbAn2VgsNcWDXoIiEiiCqr9M9HbDloYSUNsEed03b7747'
    localStorage.setItem('auth_token', testToken)
    setHasToken(true)
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {!hasToken && (
        <div className="mb-4">
          <p className="mb-2 text-sm text-gray-400">No auth token detected. For quick testing you can insert a test token:</p>
          <button onClick={useTestToken} className="bg-yellow-500 text-black px-3 py-1 rounded">Use test token</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Card details</label>
        <div className="border p-2 mb-4">
          <CardElement />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading || !stripe}>
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
