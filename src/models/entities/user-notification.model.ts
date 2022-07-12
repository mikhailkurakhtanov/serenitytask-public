export class UserNotification {
    id: number;
    creationDate: Date;
    creationDateString: string;
    type: UserNotificationType;
    isRead: boolean;

    message: string;
    senderId: string;
    receiverId: string;
}

export enum UserNotificationType {
    FriendRequest = 0,
    Message = 1,
    SessionInvitation = 2,
    SessionApprovement = 3,
    UpcomingSessionReminder = 4
}