// notifications.js - Essential components only

import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react';

// Notification types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Sound frequencies for different notification types
const SOUND_FREQUENCIES = {
    success: [523, 659, 784], // C-E-G chord
    error: [220, 185], // Low A-F#
    warning: [440, 554], // A-C#
    info: [523, 659] // C-E
};

// Sound utility functions
const playNotificationSound = (type) => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const frequencies = SOUND_FREQUENCIES[type] || SOUND_FREQUENCIES.info;

        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime + index * 0.1);
            oscillator.stop(audioContext.currentTime + 0.3 + index * 0.1);
        });
    } catch (error) {
        console.warn('Audio playback not supported:', error);
    }
};

// Individual Notification Component
const NotificationItem = ({ notification, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Auto-remove after duration
        if (notification.duration && notification.duration > 0) {
            const timer = setTimeout(() => {
                handleRemove();
            }, notification.duration);
            return () => clearTimeout(timer);
        }
    }, [notification.duration]);

    const handleRemove = () => {
        setIsLeaving(true);
        setTimeout(() => onRemove(notification.id), 300);
    };

    const getNotificationStyles = () => {
        const baseStyles = "relative overflow-hidden backdrop-blur-sm border shadow-lg";
        const typeStyles = {
            success: "bg-green-50/90 border-green-200 text-green-800",
            error: "bg-red-50/90 border-red-200 text-red-800",
            warning: "bg-yellow-50/90 border-yellow-200 text-yellow-800",
            info: "bg-blue-50/90 border-blue-200 text-blue-800"
        };
        return `${baseStyles} ${typeStyles[notification.type]}`;
    };

    const getIconComponent = () => {
        const iconProps = { className: "w-5 h-5 flex-shrink-0" };
        switch (notification.type) {
            case 'success': return <CheckCircle {...iconProps} className="w-5 h-5 text-green-500" />;
            case 'error': return <AlertCircle {...iconProps} className="w-5 h-5 text-red-500" />;
            case 'warning': return <AlertTriangle {...iconProps} className="w-5 h-5 text-yellow-500" />;
            case 'info': return <Info {...iconProps} className="w-5 h-5 text-blue-500" />;
            default: return <Bell {...iconProps} />;
        }
    };

    const getProgressBarColor = () => {
        const colors = {
            success: "bg-green-500",
            error: "bg-red-500",
            warning: "bg-yellow-500",
            info: "bg-blue-500"
        };
        return colors[notification.type];
    };

    return (
        <div
            className={`
        transform transition-all duration-300 ease-out mb-3
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isLeaving ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
        >
            <div className={`rounded-lg p-4 max-w-sm w-full ${getNotificationStyles()}`}>
                {/* Progress bar for timed notifications */}
                {notification.duration && notification.duration > 0 && (
                    <div className="bottom-0 left-0 absolute bg-black/10 w-full h-1 overflow-hidden">
                        <div
                            className={`h-full ${getProgressBarColor()} transition-all ease-linear`}
                            style={{
                                animation: `shrink ${notification.duration}ms linear forwards`
                            }}
                        />
                    </div>
                )}

                <div className="flex items-start gap-3">
                    {getIconComponent()}

                    <div className="flex-1 min-w-0">
                        {notification.title && (
                            <h4 className="mb-1 font-semibold text-sm truncate">
                                {notification.title}
                            </h4>
                        )}
                        <p className="text-sm break-words">
                            {notification.message}
                        </p>
                    </div>

                    <button
                        onClick={handleRemove}
                        className="flex-shrink-0 hover:bg-black/10 p-1 rounded-full transition-colors"
                        aria-label="Close notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Notification Container Component
export const NotificationContainer = ({ notifications, onRemove, position = 'top-right' }) => {
    const getPositionStyles = () => {
        const positions = {
            'top-right': 'top-4 right-4',
            'top-left': 'top-4 left-4',
            'bottom-right': 'bottom-4 right-4',
            'bottom-left': 'bottom-4 left-4',
            'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
            'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
        };
        return positions[position] || positions['top-right'];
    };

    if (!notifications.length) return null;

    return (
        <>
            {/* CSS Animation */}
            <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

            <div
                className={`fixed z-50 max-h-screen overflow-hidden ${getPositionStyles()}`}
                style={{ maxWidth: 'calc(100vw - 2rem)' }}
            >
                <div className="flex flex-col-reverse max-h-screen overflow-y-auto">
                    {notifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onRemove={onRemove}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

// Custom Hook for Notifications
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type: NOTIFICATION_TYPES.INFO,
            duration: 5000,
            playSound: true,
            ...notification
        };

        setNotifications(prev => [...prev, newNotification]);

        // Play sound if enabled
        if (newNotification.playSound) {
            playNotificationSound(newNotification.type);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications
    };
};