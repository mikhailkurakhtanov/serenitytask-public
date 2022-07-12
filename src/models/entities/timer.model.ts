import { Constants } from "src/components/constants";
import { Task } from "./task.model";
import { TimerMode, TimerType } from "../settings/timer-settings.model";

export class Timer {
    hours: number;
    minutes: number;
    seconds: number;

    isActive: boolean;
    isPaused: boolean;
    isCompleted: boolean;
    isInterrupted: boolean;

    trackedMinutes: number;
    activeInterval: any;

    mode: TimerMode;
    type: TimerType;

    currentTask: Task;

    constructor(customHours: number, customMinutes: number, customSeconds: number, mode: TimerMode, type: TimerType) {
        this.hours = customHours;
        this.minutes = customMinutes;
        this.seconds = customSeconds;

        this.mode = mode;
        this.type = type;

        this.isActive = false;
        this.isPaused = false;
        this.isInterrupted = false;
        this.isCompleted = false;

        this.trackedMinutes = 0;
    }

    async start() {
        this.isActive = true;
        this.isPaused = false;

        await new Promise(() => this.activeInterval = setInterval(() => {
            if (this.seconds === 0) {
                if (this.minutes > 0) {
                    this.seconds = 59;
                    this.minutes--;

                    this.trackedMinutes++;
                } else if (this.hours > 0) {
                    this.hours--;
                    this.minutes = 59;
                    this.seconds = 59;
                } else this.complete();
            } else {
                this.seconds--;

                document.title = 'Focus: ' + (this.hours > 0 ? this.hours + 'h ' : '')
                    + (this.minutes > 0 ? this.minutes + 'm ' : '')
                    + (this.seconds > 0 ? this.seconds + 's ' : '')
                    + (this.currentTask ? '- ' + this.currentTask.name : '') ;
            }
        }, 1000));
    }

    pause() {
        this.isActive = false;
        this.isPaused = true;

        clearInterval(this.activeInterval);
    }

    stop() {
        this.isActive = false;
        this.isInterrupted = true;

        clearInterval(this.activeInterval);

        this.minutes = this.type === TimerType.Manual ? 0 : 25;
        this.hours = 0;
        this.seconds = 0;

        document.title = 'SerenityTask';
    }

    complete() {
        let notificationSound = new Audio(Constants.systemSoundsUrl + 'notification_timer_done.mp3');
        notificationSound.play();

        this.isCompleted = true;
        this.stop();
    }

    addMinutes() {
        this.minutes = this.minutes < 55 ? this.minutes + 5 : 0;
        if (this.minutes === 0) this.hours++;
    }

    decreaseMinutes() {
        this.minutes = this.minutes > 5 ? this.minutes - 5 : 0;
    }

    addHours() {
        this.hours = this.hours + 1;
    }

    decreaseHours() {
        this.hours = this.hours >= 1 ? this.hours - 1 : 0;
    }
}