import { UserDetails } from "./user-details.model";
import { UserSettings } from "./user-settings.model";
import { GoogleCredential } from "./google-credential.model";
import { SettingsNotification } from "./settings-notification.model";

export class User {
  id: string;
  email: string;
  username: string;
  name: string;
  isEmailConfirmed: boolean;
  isUserOnline: boolean;
  roleId: number;
  googleCredentialToken: string;
  isGoogleCalendarConnected: boolean;

  userDetails: UserDetails;
  userSettings: UserSettings;

  googleCredential: GoogleCredential;

  settingsNotifications: SettingsNotification[];
}
