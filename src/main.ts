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

function heartbeat() {
    this.isAlive = true;
}

wss.on('connection', (ws, req) => {

    if (req.url === '/stream') {
        const streamManager = new StreamManager(ws, {
            width: '720',
            height: '480',
            fps: '12'
        });
        streamManager.send_init();
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

        ws.onclose = () => {
            servoController.calibrate();
            escController.calibrate();
        };

        ws.onerror = (err) => {
            console.log('Motors ws error : ', err);
        };
    }
    ws.isAlive = true;
    ws.on('pong', heartbeat);  
});

// Heartbeat interval
setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping('', false, true);
    });
  }, 5000);
