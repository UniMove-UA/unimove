import Page from "../components/Page";
import ChatMessage, { type ChatMessageProps } from "../components/ChatMessage";
import { useState, useRef } from "react";
import ChatHeader from "../components/ChatHeader.tsx";

interface ChatProps {
    username: string;
    fullname: string;
}

export default function ChatContent({username, fullname}: ChatProps) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const messages: ChatMessageProps[] = [
        {
            mine: false,
            text: "¡Hola! ¿Cómo va el desarrollo del proyecto?",
            img: "https://i.pravatar.cc/150?u=ana"
        },
        {
            mine: true,
            text: "Va muy bien. Ya tengo el componente ChatButton listo.",
            img: null
        },
        {
            mine: false,
            text: "Genial. ¿Has probado a subir una imagen en el chat?",
            img: null
        },
        {
            mine: true,
            text: "Sí, aquí te dejo una captura de lo que llevamos.",
            img: "https://via.placeholder.com/300x200?text=Captura+de+Pantalla"
        },
        {
            mine: false,
            text: "Se ve perfecto. Me gusta el estilo de las burbujas.",
            img: null
        },
        {
            mine: true,
            text: "Gracias. Ahora estoy trabajando en la parte de envío de mensajes.",
            img: null
        }
    ];

    const handleSend = () => {
        if (inputValue.trim()) {
            console.log("Enviando mensaje:", inputValue);
            setInputValue("");
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <Page name='mensajes'>
            <ChatHeader fullname={fullname} username={username} />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '16px',
                backgroundColor: '#e5ddd5',
                minHeight: 'calc(100vh - 120px)',
                paddingBottom: '80px',
            }}>
                {messages.map((msg, index) => (
                    <ChatMessage
                        key={index}
                        mine={msg.mine}
                        text={msg.text}
                        img={msg.img}
                    />
                ))}
            </div>

            <div style={{
                position: 'fixed',
                bottom: 90,
                left: 0,
                right: 0,
                padding: '10px 16px',
                backgroundColor: '#f0f2f5',
                borderTop: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                zIndex: 1000
            }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '24px',
                        border: 'none',
                        outline: 'none',
                        fontSize: '16px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    style={{
                        backgroundColor: inputValue.trim() ? '#008069' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '48px',
                        height: '48px',
                        cursor: inputValue.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s',
                        fontSize: '20px'
                    }}
                >
                    ➤
                </button>
            </div>
        </Page>
    );
}