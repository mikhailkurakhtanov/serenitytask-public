export class SessionMember {
    name: string;
    avatar: string;
    taskName: string;
    isJoined: boolean;
    isReady: boolean;
    isDisconnected: boolean;
    userId: string;
    sessionMemberTasks: SessionMemberTask[];

    // not related to server entity's properties
    reconnectionTimeout: number;
    isActivityDetailsVisible: boolean;
}

export class SessionMemberTask {
    taskId: number;
    startTrackingDate: Date;
    endTrackingDate: Date;
    trackedTime: number;
}