import Page from "../components/Page";
import ChatButton from "../components/ChatButton";
import { useEffect, useState } from "react";

interface ChatProps {
    username: string;
    name: string;
    last_message: string;
    img?: string;
}

export default function Chat() {
    // Estado para guardar los chats
    const [chats, setChats] = useState<ChatProps[]>([]);
    // Estado opcional para manejar errores o carga
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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

        fetchChats();
    }, []);
    if (loading) {
        return <Page name='mensajes'><h1>Cargando...</h1></Page>;
    }

    if (error) {
        return <Page name='mensajes'><h1>Error: {error}</h1></Page>;
    }

    return (
        <Page name='mensajes'>
            <h1>Mis chats</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chats.length === 0 ? (
                    <p>No tienes chats recientes.</p>
                ) : (
                    chats.map((chat, index) => (
                        <ChatButton
                            key={chat.username || index}
                            username={chat.username}
                            fullname={chat.name}
                            last_message={chat.last_message}
                            img={chat.img}
                        />
                    ))
                )}
            </div>
        </Page>
    );
}