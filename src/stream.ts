import * as Splitter from 'stream-split';
import * as raspicam from 'raspicam';
import { spawn, ChildProcess } from 'child_process';
import * as util from 'util';

const NALseparator = new Buffer([0, 0, 0, 1]);

export default class StreamManager {

  readStream;
  camera: ChildProcess;

  constructor(public ws, public options) {
    console.log('Creating stream manager');
    this.ws.send(JSON.stringify({
      action: 'init',
      width: this.options.width,
      height: this.options.height
    }));

    this.ws.on('message', (data) => {
      let cmd = '' + data,
        action = data.split(' ')[0];
      console.log('Incomming action : ' + action);

      if (action === 'REQUESTSTREAM') {
        this.start_feed();
      }
      if (action === 'STOPSTREAM') {
        this.readStream.pause();
      }
    });

    this.ws.on('close', () => {
      if (this.camera) {
        this.camera.kill();
      }
      console.log('stopping client interval');
    });

    this.ws.on('error', (err) => {
      console.log('Stream ws error : ', err);
    });

  }

  start_feed() {
    let readStream = this.get_feed();
    this.readStream = readStream;

    readStream = readStream.pipe(new Splitter(NALseparator));
    readStream.on('data', (data: Buffer) => {
      this.ws.send(Buffer.concat([NALseparator, data]), {binary: true}, (error) => {
        if (error) {
          console.log(error);
        }
      });
    });
  }


  get_feed() {
    let msk = 'raspivid -t 0 -o - -w %d -h %d -fps %d';
    let cmd = util.format(msk, this.options.width, this.options.height, this.options.fps);
    console.log('Launching camera with : ' + cmd);
    this.camera = spawn('raspivid', ['-t', '0', '-o', '-', '-w', this.options.width, '-h', this.options.height, '-fps', this.options.fps, '-pf', 'baseline']);
    this.camera.on('exit', (code) => {
      console.log('Camera process exited : ', code);
    });
    return this.camera.stdout;
  }
}
