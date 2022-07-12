export class ProblemReport {
    id: number;
    creationDateString: string;
    subject: string;
    message: string;
    isViewed: boolean;
    responseToUser: string;

    constructor() {
        this.creationDateString = '';
        this.subject = '';
        this.message = '';
        this.isViewed = false;
        this.responseToUser = '';
    }
}