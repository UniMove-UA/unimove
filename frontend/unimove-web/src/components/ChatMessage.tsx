import '../styles/Chat.css';

export interface ChatMessageProps {
    mine: boolean;
    text: string;
    img?: string | null;
}

export default function ChatMessage({ mine, text, img }: ChatMessageProps) {
    return (
        <div className={`chat-message ${mine ? 'chat-message--mine' : 'chat-message--other'}`}>
            {img && (
                <img
                    src={img}
                    alt="Adjunto"
                    className={`chat-message__image ${mine ? 'chat-message__image--mine' : ''}`}
                />
            )}

            <div className="chat-message__bubble">
                <p className="chat-message__text">{text}</p>
                <span className="chat-message__time">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}