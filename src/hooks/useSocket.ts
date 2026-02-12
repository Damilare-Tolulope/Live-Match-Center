import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../api/socket';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = getSocket();
        setSocket(socketInstance);

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);

        if (socketInstance.connected) {
            setIsConnected(true);
        }

        return () => {
            socketInstance.off('connect', onConnect);
            socketInstance.off('disconnect', onDisconnect);
            // We don't disconnect here to allow sharing the socket across components
            // Clean up handled by specific listeners or app unmount if using a provider
        };
    }, []);

    return { socket, isConnected };
};
