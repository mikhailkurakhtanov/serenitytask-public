import { Session } from "../entities/session.model";

export class CalendarEvent {
    summary: string;
    start: Date;
    end: Date;
    isActive: boolean;
    session: Session;
}