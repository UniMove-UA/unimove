import { useState, type ChangeEvent, type FormEvent } from 'react';
import '../styles/Vehicle.css';

interface VehicleFormData {
    marca: string;
    modelo: string;
    matricula: string;
    asientos: number;
}

interface VehicleRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VehicleRegistrationModal({ isOpen, onClose }: VehicleRegistrationModalProps) {
    const [formData, setFormData] = useState<VehicleFormData>({
        marca: '',
        modelo: '',
        matricula: '',
        asientos: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const token = localStorage.getItem('auth_token');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const finalValue = name === 'asientos' ? Number(value) : value;

        setFormData((prev) => ({
            ...prev,
            [name]: finalValue,
        }));

        if (error) setError(null);
        if (success) setSuccess(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('http://localhost:8000/api/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Error al registrar: ${response.statusText}`);
            }

            setSuccess(true);

            setTimeout(() => {
                setFormData({ marca: '', modelo: '', matricula: '', asientos: 0 });
                onClose();
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="vehicle-modal-overlay">
            <div className="vehicle-modal-content">
                <button className="vehicle-modal-close" onClick={onClose} aria-label="Cerrar">
                    &times;
                </button>

                <h2 className="vehicle-modal-title">Registrar un vehículo</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="marca" className="form-label">Marca</label>
                        <input
                            type="text"
                            id="marca"
                            name="marca"
                            className="form-input"
                            value={formData.marca}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Toyota"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="modelo" className="form-label">Modelo</label>
                        <input
                            type="text"
                            id="modelo"
                            name="modelo"
                            className="form-input"
                            value={formData.modelo}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Corolla"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="matricula" className="form-label">Matrícula</label>
                        <input
                            type="text"
                            id="matricula"
                            name="matricula"
                            className="form-input"
                            value={formData.matricula}
                            onChange={handleChange}
                            required
                            placeholder="Ej: 1234 ABC"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="asientos" className="form-label">Asientos totales</label>
                        <input
                            type="number"
                            id="asientos"
                            name="asientos"
                            className="form-input"
                            value={formData.asientos}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {success && <div className="error-message" style={{ color: '#10b981' }}>¡Vehículo registrado con éxito!</div>}

                    <button
                        type="submit"
                        className="btn-register"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Registrando...
                            </>
                        ) : (
                            'Registrar'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
