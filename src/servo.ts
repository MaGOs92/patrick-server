import MotorManager from './motor';
import * as servoblaster from 'servoblaster';
import { WriteStream } from "fs";

export default class ServoController implements MotorManager {

    SERVO_PIN: number = 1;
    servoStream: WriteStream;
    isWriting: boolean = false;

    curDirection: number = 150;

    directionToPwm = {
        '-3': 210,
        '-2': 190,
        '-1': 170,
        '0': 150,
        '1': 130,
        '2': 110,
        '3': 90
    };

    constructor() {
        console.log('Creating servo controller');
        this.servoStream = servoblaster.createWriteStream(this.SERVO_PIN);
    }

    calibrate() {
        console.log('Servo : calibrate()');
        if (!this.isWriting) {
            this.curDirection = 150;
            this.isWriting = true;
            this.servoStream.write(this.curDirection, () => {
                this.isWriting = false;
            });
        } else {
            console.log('Error : stream is in use');
        }
    }

    setPwm(direction: number) {
        console.log('setPwm()', direction);
        if (direction === this.curDirection) {
            return;
        }
        if (!this.isWriting) {
            this.isWriting = true;
            this.servoStream.write(direction, () => {
                this.isWriting = false;
                this.curDirection = direction;
                // this.ws.send(JSON.stringify({
                //     motor: 'servo',
                //     direction: this.curDirection
                // }));
            });
        }
    }
}