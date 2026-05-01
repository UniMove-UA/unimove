import React from 'react';

interface NotificationContainerProps {
    children?: React.ReactNode;
    className?: string;
}

export default function NotificationContainer ({children, className = ''}: NotificationContainerProps) {
    return (
        <div className={`notification-container ${className}`}>
            <h2 className="notification-title">Notificaciones</h2>
            <div className="notifications-list">
                {children}
            </div>
        </div>
    );
};

