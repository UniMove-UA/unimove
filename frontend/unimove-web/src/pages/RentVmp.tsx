import Page from "../components/Page";
import Map from "../components/Map";
import { useState, useEffect } from "react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { useNavigate } from "react-router-dom";
import "../styles/RentVmp.css";

export default function RentVmp() {
    const [vmpCode, setVmpCode] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [rentStatus, setRentStatus] = useState<string | null>(null);
    const [activeRental, setActiveRental] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Al cargar la página, comprobar si ya hay un alquiler activo
        const fetchCurrentRental = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch("/api/vmp/current", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.rental) {
                        setActiveRental(data.rental);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCurrentRental();
    }, []);

    const performRent = async (code: string) => {
        const token = localStorage.getItem('auth_token');
        // 1. Si no ha iniciado sesión, llevar al login
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setRentStatus(`Conectando con el patinete ${code}...`);
            // 2. Si está iniciado sesión, llamar a la API
            const response = await fetch("/api/vmp/rent", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });

            if (response.status === 401) {
                navigate('/login');
                return;
            }

            const data = await response.json();

            if (response.ok) {
                setRentStatus(data.message);
                setActiveRental(data.rental);
                setIsScanning(false);
            } else {
                setRentStatus(`Error: ${data.message}`);
                setIsScanning(false);
            }
        } catch (err) {
            setRentStatus("Error de red al conectar con el servidor.");
            setIsScanning(false);
        }
    };

    const handleRentByCode = () => {
        if (!vmpCode) {
            setRentStatus("Por favor, introduce un código válido.");
            return;
        }
        performRent(vmpCode);
    };

    const handleStartScan = () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            navigate('/login');
            return;
        }
        setIsScanning(true);
        setRentStatus(null);
    };

    const handleEndRental = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setRentStatus("Finalizando viaje y calculando precio...");
            const response = await fetch("/api/vmp/end", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                // 3. Cuando termine, mostramos el precio con dos decimales
                const formattedDuration = Number(data.duration).toFixed(2);
                const formattedCost = Number(data.cost).toFixed(2);
                setRentStatus(`Viaje finalizado. Tiempo: ${formattedDuration} minutos. Coste total: ${formattedCost}€.`);
                setActiveRental(null);
                setVmpCode("");
            } else {
                setRentStatus(`Error: ${data.message}`);
            }
        } catch (err) {
            setRentStatus("Error de red al finalizar el viaje.");
        }
    };

    return (
        <Page name="vmp">
            <div className="rent-vmp-layout">
                <div className="rent-vmp-map-container">
                    <Map showOnly="vmp" onRentVmp={performRent} refreshTrigger={activeRental ? activeRental.id : 'none'} />
                </div>
                <div className="rent-vmp-container">
                    <h1 className="title">Alquilar Patinete Eléctrico</h1>

                    {isLoading ? (
                        <div className="loading-spinner-container">
                            <div className="spinner"></div>
                            <p>Cargando información...</p>
                        </div>
                    ) : activeRental ? (
                        <div className="active-rental-section" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="status-message info" style={{ marginTop: 0 }}>
                                <h3>Viaje en curso</h3>
                                <p>Patinete: <strong>{activeRental.vmp?.code || 'VMP'}</strong></p>
                                <p>Hora de inicio: {new Date(activeRental.start_time).toLocaleTimeString()}</p>
                            </div>
                            <button className="rent-btn" style={{ backgroundColor: '#ef4444' }} onClick={handleEndRental}>
                                Finalizar Viaje y Pagar
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="scanner-section">
                                {isScanning ? (
                                    <div className="scanner-active">
                                        <Scanner
                                            onScan={(result) => {
                                                if (result && result.length > 0) {
                                                    const code = result[0].rawValue;
                                                    setVmpCode(code);
                                                    performRent(code);
                                                }
                                            }}
                                            onError={(error) => {
                                                console.error(error);
                                            }}
                                        />
                                        <button className="cancel-scan-btn" onClick={() => setIsScanning(false)}>
                                            Cancelar escaneo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="scanner-mockup" onClick={handleStartScan}>
                                        <div className="qr-icon-mockup">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="qr-svg">
                                                <rect x="3" y="3" width="5" height="5" rx="1"></rect>
                                                <rect x="16" y="3" width="5" height="5" rx="1"></rect>
                                                <rect x="3" y="16" width="5" height="5" rx="1"></rect>
                                                <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
                                                <path d="M21 21v.01"></path>
                                                <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
                                                <path d="M3 12h.01"></path>
                                                <path d="M12 3h.01"></path>
                                                <path d="M12 16v.01"></path>
                                                <path d="M16 12h1"></path>
                                                <path d="M21 12v.01"></path>
                                                <path d="M12 21v-1"></path>
                                            </svg>
                                        </div>
                                        <p>Toca para escanear el QR del patinete</p>
                                    </div>
                                )}
                            </div>

                            <div className="divider">
                                <span>O introduce el código</span>
                            </div>

                            <div className="manual-entry-section">
                                <input
                                    type="text"
                                    placeholder="Ej. VMP-1234"
                                    value={vmpCode}
                                    onChange={(e) => setVmpCode(e.target.value.toUpperCase())}
                                    className="vmp-input"
                                />
                                <button className="rent-btn" onClick={handleRentByCode}>
                                    Alquilar patinete
                                </button>
                            </div>
                        </>
                    )}

                    {!isLoading && rentStatus && (
                        <div className={`status-message ${rentStatus.includes('¡') || rentStatus.includes('Viaje finalizado') ? 'success' : (rentStatus.includes('Error') || rentStatus.includes('válido') ? 'error' : 'info')}`}>
                            {rentStatus}
                        </div>
                    )}
                </div>
            </div>
        </Page>
    );
}
