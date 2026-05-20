import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== passwordConfirmation) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    email,
                    password,
                    password_confirmation: passwordConfirmation
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Contraseña restablecida correctamente.');
                setTimeout(() => navigate('/login'), 2000); // redirige al login tras 2s
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
                <h2 className="login-title">Nueva contraseña</h2>
                <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Introduce tu nueva contraseña.
                </p>

                {message && <div style={{ color: 'green', marginBottom: '1rem', fontWeight: 'bold' }}>{message}</div>}
                {error && <div style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Nueva contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Confirmar contraseña"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'RESTABLECER CONTRASEÑA'}
                    </button>
                </form>

                <div className="signup-link" style={{ marginTop: '1rem' }}>
                    <Link to="/login">← Volver al inicio de sesión</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;