import { Routes, Route } from 'react-router-dom';
import Travel from './pages/Travel.tsx';
import Chat from './pages/Chat.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import UniversityAuth from "./pages/UniversityAuth.tsx";
import Main from "./pages/Main.tsx";
import ChatContent from "./pages/ChatContent.tsx";
import ProfileContainer from "./components/ProfileContainer.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import CheckoutPage from './pages/CheckoutPage.tsx';
import RentVmp from './pages/RentVmp.tsx';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/home' element={<Main />} />
        <Route path='/travel' element={<Travel />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/login' element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/auth-universidad' element={<UniversityAuth />} />
        <Route path='/rentvmp' element={<RentVmp />} />
        {/* Rutas dinámicas */}
        <Route path='/profile/:id' element={<ProfileContainer />} />
        <Route path='/chat/:id' element={<ChatContent />} />
        <Route path='/admin' element={<AdminPanel />} />
      </Routes>
    </>
  )
}

export default App;
