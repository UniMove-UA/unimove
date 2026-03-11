import './Login.css';

const Login = () => {
    return (
        <div className="login-page">
            <div className="login-card">
                <h2 className="login-title">Iniciar Sesión</h2>
                <form className="login-form">
                    <div className="form-group">
                        <input type="text" placeholder="Correo electrónico o usuario" required />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Contraseña" required />
                    </div>
                    <button type="submit" className="btn-primary">INICIAR SESIÓN</button>

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
                        <a href="#">Regístrate</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
