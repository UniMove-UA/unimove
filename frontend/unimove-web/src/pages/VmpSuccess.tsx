import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import QRCode from 'react-qr-code'

type VmpSuccessNavState = {
  returnTo?: string
  returnLabel?: string
}

export default function VmpSuccess() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const id = useMemo(() => {
    const raw = params.id
    return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : null
  }, [params.id])

  const navState = (location.state ?? null) as VmpSuccessNavState | null
  const returnTo = typeof navState?.returnTo === 'string' ? navState.returnTo : '/'
  const returnLabel = typeof navState?.returnLabel === 'string' ? navState.returnLabel : 'Volver al inicio'

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">¡Reserva completada!</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-700">
            Escanea el siguiente QR al dirigirte a tu VMP:
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center">
          <div className="rounded-xl bg-white p-4 shadow-md">
            <QRCode value={id ?? 'invalid'} size={200} />
          </div>
        </div>

        <div className="mt-4 text-center">
          {id ? (
            <p className="text-xs text-slate-600">ID: <span className="font-mono">{id}</span></p>
          ) : (
            <p className="text-xs text-amber-200">No se ha encontrado un ID válido en la URL.</p>
          )}
        </div>

        <div className="mt-7 flex justify-center">
          <button
            type="button"
            onClick={() => navigate(returnTo)}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            style={{backgroundColor:"green"}}
          >
            {returnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
