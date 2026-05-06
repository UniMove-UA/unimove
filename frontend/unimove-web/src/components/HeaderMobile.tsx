import { useState, useEffect } from 'react';
import HeaderButton from "./HeaderButton";
import NotificationContainer from "./NotificationContainer";
import "../styles/Notifications.css"
import Notification from "./Notification.tsx";
import { useNavigate } from "react-router-dom";

interface PageProps {
    page: 'inicio' | 'viajes' | 'mensajes' | 'perfil' | 'vmp';
}

interface Notification {
    id: string;
    text: string;
    read: boolean;
    date: string;
}

export default function HeaderMobile(props: PageProps) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userRole, setUserRole] = useState<string>('');
    const token = localStorage.getItem('auth_token');
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, notifRes] = await Promise.all([
                    fetch(`http://localhost:8000/api/profile/me`, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }),
                    fetch(`http://localhost:8000/api/notifications`, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }),
                ]);
                const profile = await profileRes.json();
                setUserRole(profile?.role ?? '');
                const notifData = await notifRes.json();
                setNotifications(notifData);
            } catch { }
        };
        fetchData();
    }, []);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const closeNotifications = () => {
        setShowNotifications(false);
    };

    const markAsRead = async (id: string | number) => {
        try {
            const response = await fetch(`http://localhost:8000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                console.log(`Notificación ${id} marcada como leída`);
            }
            else {
                console.error("Error al marcar notificación como leída");
            }
        } catch (err) {
            console.error("Error de red:", err);
        }
    };

    return (
        <div>
            {
                token && <header id="header_mobile_bottom">
                    <nav>
                        <HeaderButton active={props.page === 'inicio'} size={30} name='Inicio' src='house.svg' href='home' />
                        <HeaderButton active={props.page === 'viajes'} size={30} name='Viajes' src='route.svg' href='travel' />
                        <HeaderButton active={props.page === 'vmp'} size={30} name='VMP' src='vmp.svg' href='rentvmp' />
                        <HeaderButton active={props.page === 'mensajes'} size={30} name='Mensajes' src='message.svg' href='chat' />
                        <HeaderButton active={props.page === 'perfil'} size={30} name='Perfil' src='profile.svg' href='profile/me' />
                    </nav>
                </header>

            }
            <header id="header_mobile_top">
                <nav>
                    <div></div>
                    <p>UniMove</p>

                    {userRole !== 'admin' && (
                        <button
                            onClick={token ? toggleNotifications : () => { navigate('/login') }}
                            style={{
                                position: 'absolute',
                                right: 30,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                zIndex: 100
                            }}
                            aria-label="Ver notificaciones"
                        >
                            {
                                token ?
                                    <img
                                        src='/bell.svg'
                                        alt="Campana"
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            filter: showNotifications ? 'drop-shadow(0 0 2px #31A47B)' : 'none'
                                        }}
                                    /> :
                                    <img
                                        src='/profile.svg'
                                        alt="Iniciar sesión"
                                        style={{
                                            width: '24px',
                                            height: '24px'
                                        }}
                                    />
                            }

                        </button>
                    )}

                    {showNotifications && (
                        <div className="notifications-dropdown">
                            <NotificationContainer>
                                {
                                    notifications.filter(n => !n.read).map((notification: Notification, index) => (
                                        <Notification id={notification.id} key={index} message={notification.text} onMarkAsRead={markAsRead} />
                                    ))
                                }
                            </NotificationContainer>
                        </div>
                    )}
                </nav>
            </header>

            {showNotifications && (
                <div
                    className="notifications-overlay"
                    onClick={closeNotifications}
                ></div>
            )}
        </div>
    );
}