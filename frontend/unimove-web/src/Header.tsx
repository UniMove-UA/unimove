import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'flex-end', 
      padding: '1rem', 
      borderBottom: '1px solid #ccc' 
    }}>
      <Link to="/login" style={{ textDecoration: 'none', color: 'blue' }}>
        Iniciar sesión
      </Link>
    </header>
  );
};

export default Header;
