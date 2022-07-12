import { User } from "./user.model";

export class Session {
    id: number;

    creationDateString: string;
    startDateString: string;
    endDateString: string;

    duration: number;
    isHardModeActivated: boolean

    sessionMembersJSON: string;

    ownerId: string;

    owner: User;
    participants: User[];

    // not entity-related properties
    isSessionTimeNow: boolean = false;

    startDate: Date;
    endDate: Date;
    creationDate: Date;

    isUserJoined: boolean = false;
    isOwnerJoined: boolean = false;
    isParticipantJoined: boolean = false;

    isSessionReadyToStart: boolean = false;
    participantsIds: string[];
}