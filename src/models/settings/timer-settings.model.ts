export class TimerSettings {
    mode: TimerMode;
    type: TimerType;
}

export enum TimerMode {
    Easy = 0,
    Hard = 1
}

export enum TimerType {
    Manual = 0,
    Pomodoro = 1
}