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
import PublishTravel from "./pages/PublishTravel";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GoogleCallback from './pages/GoogleCallback';
import VmpSuccess from './pages/VmpSuccess.tsx';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/home' element={<Main />} />
        <Route path='/travel' element={<Travel />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/vmp-success/:id' element={<VmpSuccess />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/login' element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/auth-universidad' element={<UniversityAuth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        {/* Rutas dinámicas */}
        <Route path='/profile/:id' element={<ProfileContainer />} />
        <Route path='/chat/:id' element={<ChatContent />} />
        <Route path='/admin' element={<AdminPanel />} />
        <Route path="/travels/publish" element={<PublishTravel />} />
      </Routes>
    </>
  )
}

export default App;
