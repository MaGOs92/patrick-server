import {
    Server as WebSocketServer
} from 'ws';
import StreamManager from './stream';
import ServoController from './servo';
import ESCController from './esc';
import MotorController from './motor';

const wss = new WebSocketServer({
    port: process.env.PORT || 3000,
});

let servoController: MotorController;
let escController: MotorController;

wss.on('connection', (ws: WebSocket, req) => {

    if (req.url === '/stream') {
        const streamManager = new StreamManager(ws, {
            width: '720',
            height: '480',
            fps: '12'
        });
    }

    if (req.url === '/motors') {
        servoController = new ServoController(ws);
        escController = new ESCController(ws);

        servoController.calibrate();
        escController.calibrate();

        ws.onmessage = (msg: MessageEvent) => {
            const data = JSON.parse(msg.data);
            if (data.motor === 'esc') {
                escController.setPwm(data.speed)
            } else if (data.motor === 'servo') {
                servoController.setPwm(data.direction)
            }
        };
    }

    // TODO : Heatbeat

});
