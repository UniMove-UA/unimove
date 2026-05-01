import Page from "../components/Page";
import { useState } from "react";
import "./RentVmp.css";

export default function RentVmp() {
    const [vmpCode, setVmpCode] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [rentStatus, setRentStatus] = useState<string | null>(null);

    const handleRentByCode = () => {
        if (!vmpCode) {
            setRentStatus("Por favor, introduce un código válido.");
            return;
        }
        // Simular proceso de desbloqueo
        setRentStatus(`Desbloqueando patinete con código: ${vmpCode}...`);
        setTimeout(() => {
            setRentStatus(`¡Patinete ${vmpCode} desbloqueado exitosamente! ¡Buen viaje!`);
        }, 1500);
    };

    const handleScanQR = () => {
        setIsScanning(true);
        setRentStatus(null);
        // Simular que estamos escaneando y luego leemos un código
        setTimeout(() => {
            setIsScanning(false);
            setVmpCode("VMP-8492");
            setRentStatus("QR escaneado correctamente. Listo para alquilar.");
        }, 2500);
    };

    return (
        <Page name="vmp">
            <div className="rent-vmp-container">
                <h1 className="title">Alquilar Patinete Eléctrico</h1>
                
                <div className="scanner-section">
                    {isScanning ? (
                        <div className="scanner-mockup active">
                            <div className="scan-line"></div>
                            <p>Escaneando código QR...</p>
                        </div>
                    ) : (
                        <div className="scanner-mockup" onClick={handleScanQR}>
                            <div className="qr-icon-mockup">
                                {/* Un simple SVG inline simulando un QR para no depender de assets externos */}
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

                {rentStatus && (
                    <div className={`status-message ${rentStatus.includes('¡') ? 'success' : (rentStatus.includes('error') || rentStatus.includes('válido') ? 'error' : 'info')}`}>
                        {rentStatus}
                    </div>
                )}
            </div>
        </Page>
    );
}
