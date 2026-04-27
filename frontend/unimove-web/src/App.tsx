import { Routes, Route } from 'react-router-dom';
import Travel from './pages/Travel.tsx';
import Chat from './pages/Chat.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import UniversityAuth from "./pages/UniversityAuth.tsx";
import Main from "./pages/Main.tsx";
import ChatContent from "./pages/ChatContent.tsx";
import ProfileContainer from "./components/ProfileContainer.tsx";

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/home' element={<Main />} />
        <Route path='/travel' element={<Travel />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/login' element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/auth-universidad' element={<UniversityAuth />} />
        {/* Rutas dinámicas */}
        <Route path='/profile/:id' element={<ProfileContainer />} />
        <Route path='/chat/content' element={<ChatContent/>} />
      </Routes>
    </>
  )
}

export default App;
