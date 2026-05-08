import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    login: loginIdentifier,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('auth_token', data.access_token); //Guardar el token en localStorage
                if (data.user?.role === 'admin') {
                    navigate('/admin'); //Redirige al panel de administrador
                } else {
                    navigate('/'); //Redirige a la pagina principal
                }
            } else {
                setError(data.message || 'Error al iniciar sesión. Comprueba tus credenciales.');
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

            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '1.5rem',
                    left: '1.5rem',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    zIndex: 10,
                }}
            >
                ← Volver al inicio
            </button>

            <div className="login-card">
                <h2 className="login-title">Iniciar Sesión</h2>
                {error && <div style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Correo electrónico o usuario"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                        <Link
                            to="/forgot-password"
                            style={{ fontSize: '0.85rem', color: '#888', textDecoration: 'none' }}
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Cargando...' : 'INICIAR SESIÓN'}
                    </button>

                    <div className="login-divider">
                        <span style={{ backgroundColor: '#fff', color: '#888', padding: '0 10px', position: 'relative', zIndex: 1 }}>O inicia sesión con</span>
                    </div>

                    <div className="social-login" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            type="button"
                            onClick={() => window.location.href = 'http://localhost:8000/api/auth/google/redirect'}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.6rem 1rem',
                                border: '1px solid #dadce0',
                                borderRadius: '4px',
                                backgroundColor: '#fff',
                                color: '#3c4043',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                transition: 'box-shadow 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)')}
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                <path fill="none" d="M0 0h48v48H0z"/>
                            </svg>
                            Continuar con Google
                        </button>

                        <button type="button" className="btn-social" onClick={() => navigate('/auth-universidad')}>
                            Accede a tu universidad
                        </button>
                    </div>

                    <div className="signup-link">
                        <span>¿No tienes cuenta? </span>
                        <Link to="/register">Regístrate</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
