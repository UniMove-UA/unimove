import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
            } else {
                setError(data.message || 'Ha ocurrido un error.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <video autoPlay loop muted playsInline className="login-video-bg">
                <source src="/login-bg.mp4" type="video/mp4" />
            </video>
            <div className="login-card">
                <h2 className="login-title">¿Olvidaste tu contraseña?</h2>
                <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Introduce tu correo electrónico y te enviaremos un enlace para restablecerla.
                </p>

                {message && <div style={{ color: 'green', marginBottom: '1rem', fontWeight: 'bold' }}>{message}</div>}
                {error && <div style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Enviando...' : 'ENVIAR ENLACE'}
                    </button>
                </form>

                <div className="signup-link" style={{ marginTop: '1rem' }}>
                    <Link to="/login">← Volver al inicio de sesión</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;