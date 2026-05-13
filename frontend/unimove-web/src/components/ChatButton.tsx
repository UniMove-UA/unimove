import '../styles/Chat.css';
import {Link} from "react-router-dom";

interface ChatButtonProps {
    username: string;
    fullname: string;
    last_message: string;
    img?: string;
}

export default function ChatButton({username, fullname, last_message, img}: ChatButtonProps) {
    const imageUrl = img || 'default_user.jpg';

    return (
        <Link className="chat-button" to={`/chat/@${username}`}>
            <img src={imageUrl} alt={fullname} className="chat-button__avatar" onError={(e) => { e.currentTarget.src = '/default_user.jpg'; }} />
            <div className="chat-button__content">
                <div className="chat-button__header">
                    <span className="chat-button__fullname">{fullname}</span>
                    <span className="chat-button__username">@{username}</span>
                </div>
                <p className="chat-button__last-message">{last_message}</p>
            </div>
        </Link>
    );
}