import Main from './pages/Main.tsx';
import { Routes, Route } from 'react-router-dom';
import Travel from './pages/Travel.tsx';
import Chat from './pages/Chat.tsx';
import Profile from './pages/Profile.tsx';

function App() {
  return (
    <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/travel' element={<Travel/>} />
        <Route path='/chat' element={<Chat/>} />
        <Route path='/profile' element={<Profile/>} />
    </Routes>
  )
}

export default App
