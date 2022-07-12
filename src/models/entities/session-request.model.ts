export class SessionRequest {
    id: number;

    sendingDateString: string;
    startString: string;
    endString: string;

    duration: number;
    isRead: boolean;
    senderId: string;
    receiverId: string;

    // not related to db entity properties
    sendingDate: Date;
    start: Date;
    end: Date;
}