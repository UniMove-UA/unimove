import Main from './pages/Main.tsx';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
        <Route path='/' element={<Main />} />
    </Routes>
  )
}

export default App
