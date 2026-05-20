import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useNavigate } from 'react-router-dom'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

type PaymentType = 'carpool' | 'vmp'

interface CheckoutFormProps {
  paymentType: PaymentType
  paymentId: number
  amount: number
}

function CheckoutForm({ paymentType, paymentId, amount }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cardBrand, setCardBrand] = useState<string>('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const token = localStorage.getItem('auth_token')
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }

    const resp = await fetch('http://localhost:8000/api/payments/create-intent', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ type: paymentType, id: paymentId, currency: 'eur' })
    })

    const data = await resp.json()
    if (!resp.ok) {
      setStatus(data.error || 'Error al crear el pago')
      setLoading(false)
      return
    }

    const clientSecret = data.clientSecret
    const paymentIntentId = data.payment_intent_id

    if (!stripe || !elements) {
      setStatus('Stripe no está cargado')
      setLoading(false)
      return
    }

    const card = elements.getElement(CardNumberElement)
    if (!card) {
      setStatus('El elemento de tarjeta no está listo')
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

    if (confirm.error) {
      setStatus(confirm.error.message || 'El pago ha fallado')
      setLoading(false)
      return
    }

    if (confirm.paymentIntent?.status === 'succeeded') {
      if (paymentType === 'vmp') {
        navigate(`/vmp-success/${paymentId}`)
        setLoading(false)
        return
      }

      if (paymentType === 'carpool') {
        try {
          const bookingResp = await fetch('http://localhost:8000/api/bookings/paid', {
            method: 'POST',
            credentials: 'include',
            headers,
            body: JSON.stringify({
              booking_id: paymentId,
              payment_intent_id: paymentIntentId,
            }),
          })

          const bookingData = await bookingResp.json()

          if (!bookingResp.ok) {
            setStatus(`Pago realizado pero hubo un problema con la reserva: ${bookingData.message}. Contacta con soporte.`)
            setLoading(false)
            return
          }

          setStatus('¡Pago y reserva completados con éxito!')
          setTimeout(() => { navigate('/travel') }, 2000)

        } catch {
          setStatus('Pago realizado pero no se pudo confirmar la reserva. Contacta con soporte.')
        }
      } else {
        setStatus('¡Pago completado con éxito!')
        setTimeout(() => { navigate('/travel') }, 2000)
      }
    } else {
      setStatus('El pago está siendo procesado')
    }

    setLoading(false)
  }

  return (
      <div className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Datos de la tarjeta</label>
          <div className="grid grid-cols-3 gap-2 border p-2 mb-4">
            <div className="col-span-2">
              <label className="text-xs">Número</label>
              <div className="mt-1">
                <CardNumberElement
                    options={{ placeholder: '4242 4242 4242 4242' }}
                    onChange={(e) => setCardBrand(e.brand || '')}
                />
              </div>
            </div>
            <div>
              <label className="text-xs">Exp</label>
              <div className="mt-1"><CardExpiryElement /></div>
            </div>
            <div className="col-span-1 mt-2">
              <label className="text-xs">CVC</label>
              <div className="mt-1"><CardCvcElement options={{ placeholder: 'CVC' }} /></div>
              <p className="text-xs text-gray-500 mt-1">
                {cardBrand === 'amex' ? 'CVC: 4 dígitos (AMEX)' : 'CVC: 3 dígitos'}
              </p>
            </div>
          </div>
          <button
              style={{ backgroundColor: '#0ea5a6', color: '#000' }}
              className="px-4 py-2 rounded"
              disabled={loading || !stripe}
          >
            {loading ? 'Procesando…' : `Pagar ${amount.toFixed(2)}€`}
          </button>
        </form>
        {status && (
            <p className={`mt-4 font-medium ${status.includes('éxito') ? 'text-green-600' : 'text-red-600'}`}>
              {status}
            </p>
        )}
      </div>
  )
}

interface CheckoutProps {
  paymentType: PaymentType
  paymentId: number
  amount: number
}

export default function Checkout({ paymentType, paymentId, amount }: CheckoutProps) {
  return (
      <Elements stripe={stripePromise}>
        <CheckoutForm paymentType={paymentType} paymentId={paymentId} amount={amount} />
      </Elements>
  )
}