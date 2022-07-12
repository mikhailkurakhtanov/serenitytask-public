export class SettingsNotification {
  id: number;
  result: boolean;
  message: string;
  type: NotificationType;
}

export enum NotificationType {
  Email,
  Password
}
