import { Routes, Route } from 'react-router-dom';
import Travel from './pages/Travel.tsx';
import Chat from './pages/Chat.tsx';
import Profile from './pages/Profile.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import UpdateProfile from './pages/Update_profile.tsx';
import UniversityAuth from "./pages/UniversityAuth.tsx";
import Main from "./pages/Main.tsx";

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/travel' element={<Travel />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/modificar-datos' element={<UpdateProfile />} />
        <Route path='/login' element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='/auth-universidad' element={<UniversityAuth />} />
      </Routes>
    </>
  )
}

export default App;
