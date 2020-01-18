import socketio from 'socket.io-client';
import apiConfig from '../configs/apiConfig';

const socket = socketio(apiConfig.baseURL, {
    autoConnect:  false
});

const connect = (latitude, longitude, techs) => {
    if(socket.disconnected) {
        socket.io.opts.query = {
            latitude,
            longitude,
            techs
        };
    
        socket.connect();
    }
}

const disconnect = () => {
    if(socket.connected){
        socket.disconnect();
    }
}

const subscribeToNewDevelopers = (subscribeFunction) => {
    console.log('Receiving...');
    socket.on('new-dev', subscribeFunction);
}

export {
    connect,
    disconnect,
    subscribeToNewDevelopers
}