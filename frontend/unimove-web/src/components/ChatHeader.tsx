import { useNavigate } from 'react-router-dom';
import '../styles/Chat.css';

interface ChatHeaderProps {
    fullname: string;
    username: string;
}

export default function ChatHeader({ fullname, username }: ChatHeaderProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/chat');
    };

    return (
        <header className="chat-header">
            <button className="chat-header__back" onClick={handleBack} aria-label="Volver">
                ←
            </button>

            <div className="chat-header__info">
                <span className="chat-header__fullname">{fullname}</span>
                <span className="chat-header__username">@{username}</span>
            </div>

            <div className="chat-header__actions"></div>
        </header>
    );
}