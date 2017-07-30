import {
    Server as WebSocketServer
} from 'ws';
import StreamManager from './stream';

const wss = new WebSocketServer({
    port: process.env.PORT || 3000
});

wss.on('connection', (ws) => {
    console.log('Connected to new client : ' + ws);
    const streamManager = new StreamManager(ws, {
        width: '720',
        height: '480',
        fps: '12'
    });
});
