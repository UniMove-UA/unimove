import Page from "../components/Page";
import ChatButton from "../components/ChatButton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ChatProps {
    username: string;
    name: string;
    last_message: string;
    image?: string;
}

export default function Chat() {
    const [chats, setChats] = useState<ChatProps[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [usernameInput, setUsernameInput] = useState("");
    const [modalError, setModalError] = useState<string | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch("http://localhost:8000/api/chats/me", {
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
            setChats(data);
        } catch (err) {
            console.error("Error al cargar los chats:", err);
            setError("No se pudieron cargar los mensajes.");
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usernameInput.trim()) return;

        setModalLoading(true);
        setModalError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://localhost:8000/api/chats/me?user=${usernameInput.trim()}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                setModalError(data.message || 'Error al iniciar el chat');
                return;
            }

            setModalOpen(false);
            setUsernameInput("");
            setModalError(null);
            navigate(`/chat/@${usernameInput.trim()}`);
        } catch {
            setModalError('Error al iniciar el chat');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setUsernameInput("");
        setModalError(null);
    };

    if (loading) {
        return <Page name='mensajes'><h1>Cargando...</h1></Page>;
    }

    if (error) {
        return <Page name='mensajes'><h1>Error: {error}</h1></Page>;
    }

    return (
        <Page name='mensajes'>
            <h1>Mis chats</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '2vw' }}>
                {chats.length === 0 ? (
                    <p>No tienes chats recientes.</p>
                ) : (
                    chats.map((chat, index) => (
                        <ChatButton
                            key={chat.username || index}
                            username={chat.username}
                            fullname={chat.name}
                            last_message={chat.last_message}
                            img={chat.image ? `http://localhost:8000/storage/${chat.image}` : undefined}
                        />
                    ))
                )}
                <button
                    onClick={() => setModalOpen(true)}
                    style={{
                        padding: '12px 30px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        maxWidth: '300px',
                    }}
                >
                    Nuevo chat
                </button>
            </div>

            {modalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}
                    onClick={handleCloseModal}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            width: '300px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginTop: 0 }}>Nuevo chat</h2>
                        <form onSubmit={handleNewChat}>
                            <input
                                type="text"
                                placeholder="Nombre de usuario"
                                value={usernameInput}
                                onChange={(e) => {
                                    setUsernameInput(e.target.value);
                                    if (modalError) setModalError(null);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    marginBottom: '12px',
                                    boxSizing: 'border-box',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc'
                                }}
                                autoFocus
                            />
                            {modalError && (
                                <p style={{ color: 'red', fontSize: 13, marginBottom: 8, marginTop: -8 }}>
                                    {modalError}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={modalLoading}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: modalLoading ? '#9ca3af' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: modalLoading ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {modalLoading ? 'Iniciando...' : 'Añadir'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Page>
    );
}