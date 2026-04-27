import { useState } from 'react';
import HeaderButton from "./HeaderButton";
import NotificationContainer from "./NotificationContainer";
import "../styles/Notifications.css"
import Notification from "./Notification.tsx";

interface PageProps {
    page: 'inicio' | 'viajes' | 'mensajes' | 'perfil';
}

export default function HeaderMobile(props: PageProps) {
    const [showNotifications, setShowNotifications] = useState(false);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const closeNotifications = () => {
        setShowNotifications(false);
    };

    return (
        <div>
            <header id="header_mobile_bottom">
                <nav>
                    <HeaderButton active={props.page === 'inicio'} size={30} name='Inicio' src='house.svg' href='home' />
                    <HeaderButton active={props.page === 'viajes'} size={30} name='Viajes' src='route.svg' href='travel' />
                    <HeaderButton active={props.page === 'mensajes'} size={30} name='Mensajes' src='message.svg' href='chat' />
                    <HeaderButton active={props.page === 'perfil'} size={30} name='Perfil' src='profile.svg' href='profile/me' />
                </nav>
            </header>
            <header id="header_mobile_top">
                <nav>
                    <div></div>
                    <p>UniMove</p>

                    <button
                        onClick={toggleNotifications}
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
                        <img
                            src='/bell.svg'
                            alt="Campana"
                            style={{
                                width: '24px',
                                height: '24px',
                                filter: showNotifications ? 'drop-shadow(0 0 2px #31A47B)' : 'none'
                            }}
                        />
                    </button>

                    {showNotifications && (
                        <div className="notifications-dropdown">
                            <NotificationContainer>
                                <Notification id={"1"} message={"¡Las notificaciones funcionan!"}/>
                                <Notification id={"2"} message={"Ahora falta la integración con la API."}/>
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