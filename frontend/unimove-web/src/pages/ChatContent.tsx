import Page from "../components/Page";
import ChatMessage, { type ChatMessageProps } from "../components/ChatMessage";
import {useState, useRef, useEffect} from "react";
import ChatHeader from "../components/ChatHeader.tsx";

export default function ChatContent() {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<ChatMessageProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null)
    const [chatUser, setChatUser] = useState<{ name: string; username: string } | null>(null);
    const id  = window.location.href.split("@")[1];

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('auth_token');

                const userResponse = await fetch(`http://localhost:8000/api/profile/@${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setChatUser({
                        name: userData.name,
                        username: userData.username
                    });
                }

                const response = await fetch(`http://localhost:8000/api/chats/@${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                setMessages(data);
            } catch (err) {
                console.error("Error al cargar los chats:", err);
                setError("No se pudieron cargar los mensajes.");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);
    if (loading) {
        return <Page name='mensajes'><h1>Cargando...</h1></Page>;
    }

    if (error) {
        return <Page name='mensajes'><h1>Error: {error}</h1></Page>;
    }

    const handleSend = async () => {
        if (inputValue.trim()) {
            const token = localStorage.getItem('auth_token');
            await fetch(`http://localhost:8000/api/chats/@${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: inputValue,
                    url: null
                })

            });
            setInputValue("");


            if (inputRef.current) {
                inputRef.current.focus();
            }

            const updatedMessages = await fetch(`http://localhost:8000/api/chats/@${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => res.json());

            setMessages(updatedMessages);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <Page name='mensajes'>
            <ChatHeader fullname={chatUser?.name || "Usuario"} username={chatUser?.username || id || "desconocido"} />
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
                        created_at={msg.created_at}
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