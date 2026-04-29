import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const UniversityAuth = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // evita que la página se recargue
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/auth/universidad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('auth_token', data.access_token);
                navigate('/');
            } else {
                alert(data.message || "Error al conectar con el portal");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("No se pudo conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" style={{ background: '#f4f7f6' }}>
            <div className="login-card" style={{ 
                borderTop: '6px solid #003366', 
                boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
                padding: '40px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <span style={{ fontSize: '3rem' }}>🏛️</span>
                    <h2 style={{ color: '#003366', margin: '10px 0 5px 0' }}>Acceso UA</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Identifícate con tu correo @alu.ua.es / @ua.es </p>
                </div>
                
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#003366', marginBottom: '5px', display: 'block' }}>
                            CORREO INSTITUCIONAL
                        </label>
                        <input 
                            type="email" 
                            placeholder="nombre@alu.ua.es" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ background: '#f9f9f9', border: '1px solid #ddd' }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading}
                        style={{ background: '#003366', marginTop: '10px' }}
                    >
                        {loading ? 'VALIDANDO...' : 'INICIAR SESIÓN'}
                    </button>

                    <div className="signup-link" style={{ marginTop: '25px' }}>
                        <a href="/login" style={{ color: '#003366', fontSize: '0.85rem' }}>
                            ← Volver al acceso general
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UniversityAuth;