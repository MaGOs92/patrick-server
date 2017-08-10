export default interface Motor {
    calibrate();
    setPwm(pwm: string);
}