// RatingModal.tsx
import { useState } from 'react';
import '../styles/Modals.css'; 

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    travelId: number;
    revieweeId: number;
    revieweeName: string;
    onSuccess: () => void;
}

export default function RatingModal({ isOpen, onClose, travelId, revieweeId, revieweeName, onSuccess }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Nuevo estado para el error
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        // Limpiamos errores previos
        setError(null);

        if (rating === 0) {
            setError("Por favor, selecciona una puntuación de 1 a 5 estrellas.");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:8000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    travel_id: travelId,
                    reviewee_id: revieweeId,
                    rating: rating,
                    comment: comment
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al enviar la valoración");
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error valorando:", err);
            setError(err instanceof Error ? err.message : "Error al enviar la valoración");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Valorar trayecto</h2>
                
                {error && (
                    <div className="modal-error-alert">
                        {error}
                    </div>
                )}

                <p style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#666' }}>
                    ¿Cómo fue tu experiencia con <strong>{revieweeName}</strong>?
                </p>
                
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={`star-btn ${rating >= star ? 'selected' : ''}`}
                            onClick={() => {
                                setRating(star);
                                if(error) setError(null); // Limpiar error al interactuar
                            }}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <textarea
                    placeholder="Escribe un comentario opcional..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="rating-textarea"
                />

                <div className="modal-actions">
                    <button onClick={onClose} className="btn-modal-cancel" disabled={isSubmitting}>
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="btn-modal-confirm" disabled={isSubmitting}>
                        {isSubmitting ? "Enviando..." : "Confirmar"}
                    </button>
                </div>
            </div>
        </div>
    );
}