import { useState, type ChangeEvent, type FormEvent } from 'react';
import '../styles/Vehicle.css';

interface VehicleFormData {
    brand: string;
    model: string;
    plate: string;
    total_seats: number;
}

interface VehicleRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function VehicleRegistrationModal({ isOpen, onClose }: VehicleRegistrationModalProps) {
    const [formData, setFormData] = useState<VehicleFormData>({
        brand: '',
        model: '',
        plate: '',
        total_seats: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const token = localStorage.getItem('auth_token');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const finalValue = name === 'total_seats' ? Number(value) : value;

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
                let errorMessage = `Error al registrar: ${response.statusText}`;

                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.errors) {
                        const errors = Object.values(errorData.errors).flat();
                        errorMessage = errors.join(', ');
                    }
                } catch (e) {
                    console.error("El error no es JSON:", e);
                }

                throw new Error(errorMessage);
            }
            setSuccess(true);

            setTimeout(() => {
                setFormData({ brand: '', model: '', plate: '', total_seats: 0 });
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
                        <label htmlFor="brand" className="form-label">Marca</label>
                        <input
                            type="text"
                            id="brand"
                            name="brand"
                            className="form-input"
                            value={formData.brand}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Toyota"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="model" className="form-label">Modelo</label>
                        <input
                            type="text"
                            id="model"
                            name="model"
                            className="form-input"
                            value={formData.model}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Corolla"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="plate" className="form-label">Matrícula</label>
                        <input
                            type="text"
                            id="plate"
                            name="plate"
                            className="form-input"
                            value={formData.plate}
                            onChange={handleChange}
                            required
                            placeholder="Ej: 1234 ABC"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="total_seats" className="form-label">Asientos totales</label>
                        <input
                            type="number"
                            id="total_seats"
                            name="total_seats"
                            className="form-input"
                            value={formData.total_seats}
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
