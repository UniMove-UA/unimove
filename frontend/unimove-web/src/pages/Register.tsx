import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'; // Importamos el CSS de tu compañero

const Register = () => {

    // estados para capturar los datos
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // evita que la página se recargue

        try {
            // petición al backend de laravel
            const response = await fetch('http://localhost:8000/api/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({name, email, password})
            });

            const data = await response.json();

            if (response.ok) {
                // guardamos el token de Sanctum
                console.log('Registro exitoso:', data.message);
                localStorage.setItem('auth_token', data.access_token);
                
                // redirigimos al usuario a la página principal
                navigate('/');
            } else {
                alert("Error: " + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error de red:', error);
        }
    };

    return (
        <div className="login-page">
            <video autoPlay loop muted playsInline className="login-video-bg">
                <source src="/login-bg.mp4" type="video/mp4" />
            </video>
            
            <div className="login-card">
                <h2 className="login-title">Crear Cuenta</h2>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="Nombre completo" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="email" 
                            placeholder="Correo electrónico" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="password" 
                            placeholder="Contraseña" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary">
                        REGISTRARSE
                    </button>

                    <div className="signup-link">
                        <span>¿Ya tienes cuenta? </span>
                        <a href="/login">Inicia sesión</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;