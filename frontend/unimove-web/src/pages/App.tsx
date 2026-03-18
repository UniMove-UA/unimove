import Main from './Main.tsx';
import Login from './Login.tsx';
import Header from '../components/Header.tsx';
import Update from './Update_profile.tsx';
import Register from './Register';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path='/modificar-datos' element={<Update />} />
        <Route path='/' element={<Main />} />
        <Route path='/login' element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App;
