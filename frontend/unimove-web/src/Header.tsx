import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '1.5rem 2rem',
      zIndex: 10,
      boxSizing: 'border-box',
      background: isLoginPage ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
      boxShadow: isLoginPage ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}>
      <Link to={isLoginPage ? "/" : "/login"} style={{
        textDecoration: 'none',
        color: isLoginPage ? '#FFFFFF' : '#31A47B',
        fontWeight: '700',
        fontSize: '1rem',
        textShadow: isLoginPage ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
      }}>
        {isLoginPage ? "Volver a página principal" : "Iniciar sesión"}
      </Link>
    </header>
  );
};

export default Header;
