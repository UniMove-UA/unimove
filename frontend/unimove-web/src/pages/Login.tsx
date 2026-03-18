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
            const response = await fetch('http://localhost:8000/api/login', {
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
                navigate('/'); //Redirige a la pagina principal
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
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Cargando...' : 'INICIAR SESIÓN'}
                    </button>

                    <div className="login-divider">
                        <span style={{ backgroundColor: '#fff', color: '#888', padding: '0 10px', position: 'relative', zIndex: 1 }}>O inicia sesión con</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="btn-social">
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
