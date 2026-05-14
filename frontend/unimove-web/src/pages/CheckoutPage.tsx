import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Checkout from '../components/Checkout'

type PaymentType = 'carpool' | 'vmp'

interface CheckoutSummary {
  type: PaymentType
  id: number
  amount: number
  label: string
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<CheckoutSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const typeParam = searchParams.get('type')
    const idParam = searchParams.get('id')

    if (!typeParam || !idParam) {
      setError('Faltan parámetros de pago en la URL.')
      setLoading(false)
      return
    }

    const paymentType = typeParam as PaymentType
    const paymentId = Number(idParam)

    if (!['carpool', 'vmp'].includes(paymentType) || Number.isNaN(paymentId)) {
      setError('Parámetros de pago inválidos.')
      setLoading(false)
      return
    }

    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }

        if (paymentType === 'carpool') {
          const createResponse = await fetch('http://localhost:8000/api/bookings', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ travel_id: paymentId }),
          })

          if (createResponse.ok) {
            const created = await createResponse.json()
            const booking = created?.data
            const price = Number(booking?.travel?.price ?? 0)
            const priceToCharge = Math.max(0.5, price)
            const destination = booking?.travel?.destination ?? 'destino'
            const bookingId = Number(booking?.id ?? paymentId)
            setSummary({
              type: paymentType,
              id: bookingId,
              amount: priceToCharge,
              label: `Estás a punto de pagar ${priceToCharge.toFixed(2)}€ por el viaje a ${destination}`,
            })
          } else {
            const errorBody = await createResponse.json().catch(() => ({}))
            const existingResponse = await fetch('http://localhost:8000/api/bookings/me', { headers, credentials: 'include' })
            if (existingResponse.ok) {
              const bookings = await existingResponse.json()
              const existing = (bookings || []).find((b: any) => b?.travel_id === paymentId || b?.travel?.id === paymentId)
              if (existing) {
                const price = Number(existing?.travel?.price ?? 0)
                const priceToCharge = Math.max(0.5, price)
                const destination = existing?.travel?.destination ?? 'destino'
                const bookingId = Number(existing?.id ?? paymentId)
                setSummary({
                  type: paymentType,
                  id: bookingId,
                  amount: priceToCharge,
                  label: `Estás a punto de pagar ${priceToCharge.toFixed(2)}€ por el viaje a ${destination}`,
                })
                return
              }
            }
            const message = errorBody?.message || errorBody?.error || 'No se pudo crear la reserva'
            throw new Error(message)
          }
        } else {
          const response = await fetch(`http://localhost:8000/api/vmp/${paymentId}`, { headers, credentials: 'include' })
          if (!response.ok) throw new Error('No se pudo cargar el VMP')
          const vmp = await response.json()
          const price = Number(vmp?.unlock_price ?? vmp?.price_per_minute ?? 0)
          setSummary({
            type: paymentType,
            id: paymentId,
            amount: price,
            label: `Estás a punto de pagar ${price.toFixed(2)}€ por el desbloqueo de patinete`,
          })
        }
      } catch (err) {
        console.error(err)
        const message = err instanceof Error ? err.message : 'No se pudo preparar el pago.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [searchParams])

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/travel')}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '1.5rem',
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '8px',
          color: '#111',
          fontSize: '0.9rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          zIndex: 1000,
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
        }}
      >
        ← Volver atrás
      </button>
      <h1 className="text-2xl mb-4">Checkout</h1>
      {loading && <p>Preparando pago...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {summary && !loading && (
        <>
          <p className="mb-4">{summary.label}</p>
          <Checkout paymentType={summary.type} paymentId={summary.id} amount={summary.amount} />
        </>
      )}
    </div>
  )
}
