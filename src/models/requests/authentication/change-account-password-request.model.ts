export class ChangeAccountPasswordRequest {
    userEmail: string;
    newPassword: string;

    newPasswordConfirmation: string;

    constructor() {
        this.userEmail = '';
        this.newPassword = '';
        this.newPasswordConfirmation = '';
    }
}