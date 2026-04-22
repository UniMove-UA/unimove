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
        <div className="login-page" style={{ background: 'linear-gradient(135deg, #002147 0%, #003366 100%)' }}>
            <div className="login-card" style={{ borderTop: '5px solid #0084c2' }}>
                <h2 className="login-title">Portal Institucional</h2>
                <p style={{ marginBottom: '20px', color: '#555', fontSize: '0.9rem' }}>
                    Acceso seguro para estudiantes de la <strong>UA</strong>.
                </p>
                
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <input 
                            type="email" 
                            placeholder="estudiante@alu.ua.es" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ border: '1px solid #ddd' }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading}
                        style={{ background: loading ? '#666' : '#1e3a8a' }}
                    >
                        {loading ? 'CONECTANDO...' : 'INICIAR SESIÓN'}
                    </button>

                    <div className="signup-link">
                        <a href="/login" style={{ color: '#002147', fontWeight: 'bold' }}>
                            ← Volver al login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UniversityAuth;