import React, { createContext, useContext } from 'react';
import { useNotifications, NotificationContainer } from '../Notification/Notifications';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, position = 'top-right' }) => {
    const notificationMethods = useNotifications();

    return (
        <NotificationContext.Provider value={notificationMethods}>
            {children}
            <NotificationContainer
                notifications={notificationMethods.notifications}
                onRemove={notificationMethods.removeNotification}
                position={position}
            />
        </NotificationContext.Provider>
    );
};

// Custom hook to use notifications anywhere in your app
export const useGlobalNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useGlobalNotifications must be used within NotificationProvider');
    }
    return context;
};

export default NotificationProvider;