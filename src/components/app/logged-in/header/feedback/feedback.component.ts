import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { ProblemReport } from "src/models/entities/problem-report.model";
import { SystemMaintenanceService } from "src/services/api/system-maintenance.service";

@Component({
    selector: 'feedback',
    templateUrl: 'feedback.component.html',
    styleUrls: ['feedback.component.css']
})
export class FeedbackComponent implements OnInit {
    @Input() isPopupVisible: boolean;

    @Output() isPopupShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

    problemReport: ProblemReport;
    buttonText: string;
    isButtonDisabled: boolean;

    isMessageErrorMessageVisible: boolean;
    isSubjectErrorMessageVisible: boolean;

    isToastNotificationVisible: boolean;
    toastNotificationContent: string;

    constructor(private systemMaintenanceService: SystemMaintenanceService) { }

    ngOnInit(): void {
        this.problemReport = new ProblemReport;
        this.buttonText = 'Send a report';
        this.isButtonDisabled = false;
        this.isPopupVisible = false;

        this.isMessageErrorMessageVisible = false;
        this.isSubjectErrorMessageVisible = false;

        this.isToastNotificationVisible = false;
    }

    createProblemReport() {
        let validationResult = this.isFormValidated();
        if (validationResult) {
            this.buttonText = 'Processing...';
            this.isButtonDisabled = true;

            this.systemMaintenanceService.create(this.problemReport).subscribe(() => {
                this.toastNotificationContent = 'Your report has been sent to our team. Thanks!';
                this.isToastNotificationVisible = true;

                this.refreshProblemReport();
                setTimeout(() => {
                    this.isToastNotificationVisible = false;
                }, 3000);
            });
        }
    }

    isFormValidated(): boolean {
        this.isMessageErrorMessageVisible = this.problemReport.message.length === 0;
        this.isSubjectErrorMessageVisible = this.problemReport.subject.length === 0;

        return !this.isMessageErrorMessageVisible && !this.isSubjectErrorMessageVisible;
    }

    refreshProblemReport() {
        this.problemReport = new ProblemReport;
        this.rollbackButton();
    }

    rollbackButton() {
        this.buttonText = 'Send a report';
        this.isButtonDisabled = false;
    }
}