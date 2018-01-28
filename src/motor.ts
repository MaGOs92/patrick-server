export default interface Motor {
    calibrate();
    setPwm(pwm: number);
}