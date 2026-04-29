import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Register = () => {

    // estados para capturar los datos
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // evita que la página se recargue
        
        if (formData.password !== formData.password_confirmation) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            // petición al backend de laravel
            const response = await fetch('http://localhost:8000/api/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: `${formData.name} ${formData.surname}`, // combinamos para el campo 'name'
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    password_confirmation: formData.password_confirmation
                })
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
            
            <div className="login-card" style={{ maxWidth: '450px' }}>
                <h2 className="login-title">Crear Cuenta</h2>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    {/* Fila de Nombre y Apellidos */}
                    <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Nombre" 
                            required
                            style={{ flex: 1 }} // Ocupa la mitad exacta
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                        <input 
                            type="text" 
                            placeholder="Apellidos" 
                            required
                            style={{ flex: 1 }} // Ocupa la otra mitad
                            onChange={(e) => setFormData({...formData, surname: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <input 
                            type="text" placeholder="Nombre de usuario" required
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <input 
                            type="email" placeholder="Correo electrónico" required
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <input 
                            type="password" placeholder="Contraseña" required
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <input 
                            type="password" placeholder="Confirmar contraseña" required
                            onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
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