import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Login from './Login';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div style={{ padding: '2rem' }}>Página Principal</div>} />
      </Routes>
    </Router>
  );
}

export default App;
