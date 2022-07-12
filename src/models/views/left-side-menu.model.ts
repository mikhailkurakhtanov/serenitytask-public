export class TasksNumberByInterval {
    inbox: number;
    overdue: number;
    today: number;
    tomorrow: number;
    thisWeek: number;
    upcoming: number;

    constructor() {
        this.inbox = 0;
        this.overdue = 0;
        this.today = 0;
        this.tomorrow = 0;
        this.thisWeek = 0;
        this.upcoming = 0;
    }
}