import Page from "../components/Page";
import ChatButton from "../components/ChatButton";

interface ChatProps {
    username: string;
    fullname: string;
    last_message: string;
    img?: string;
}

export default function Chat() {

    // Hacer un fetch a la API en /chats?
    const chats: ChatProps[] = [
        {
            username: "ana_dev",
            fullname: "Ana García",
            last_message: "¡El deploy a producción fue exitoso!",
            img: "https://i.pravatar.cc/150?u=ana"
        },
        {
            username: "carlos_pm",
            fullname: "Carlos Rodríguez",
            last_message: "¿Podemos revisar los requisitos del sprint mañana?",
            img: "https://i.pravatar.cc/150?u=carlos"
        },
        {
            username: "laura_ux",
            fullname: "Laura Martínez",
            last_message: "He subido los nuevos mockups a Figma.",
        },
        {
            username: "miguel_qa",
            fullname: "Miguel Ángel López",
            last_message: "Encontré un bug crítico en el login.",
            img: "https://i.pravatar.cc/150?u=miguel"
        },
        {
            username: "soporte_tech",
            fullname: "Soporte Técnico",
            last_message: "Su ticket #4092 ha sido resuelto.",
            img: "https://i.pravatar.cc/150?u=soporte"
        },
        {
            username: "julia_design",
            fullname: "Julia Fernández",
            last_message: "Gracias por la ayuda con el componente.",
        }
    ];

    return (
        <Page name='mensajes'>
            <h1>Mis chats</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chats.map((chat, index) => (
                    <ChatButton
                        key={index}
                        username={chat.username}
                        fullname={chat.fullname}
                        last_message={chat.last_message}
                        img={chat.img}
                    />
                ))}
            </div>
        </Page>
    );
}