import '../styles/Login.css'; // Importamos el CSS de tu compañero

const Register = () => {
    return (
        <div className="login-page">
            <video autoPlay loop muted playsInline className="login-video-bg">
                <source src="/login-bg.mp4" type="video/mp4" />
            </video>
            
            <div className="login-card">
                <h2 className="login-title">Crear Cuenta</h2>
                
                <form className="login-form">
                    <div className="form-group">
                        <input 
                            type="text" 
                            placeholder="Nombre completo" 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="email" 
                            placeholder="Correo electrónico" 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="password" 
                            placeholder="Contraseña" 
                            required 
                        />
                    </div>
                    
                    <button type="button" className="btn-primary">
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