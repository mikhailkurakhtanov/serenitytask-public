import { trigger, transition, style, sequence, animate, state } from "@angular/animations";
import { Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";

@Component({
    selector: 'sorana-toast-notification',
    templateUrl: 'sorana-toast-notification.component.html',
    styleUrls: ['sorana-toast-notification.component.css'],
    animations: [
        trigger('changeNotificationState', [
            transition('* => true', [
                style({ opacity: 0 }),
                sequence([
                    animate('0.5s ease',
                        style({ opacity: 1 }))
                ])
            ]),
            state('true', style({ opacity: 1 })),
            transition('true => false', [
                sequence([
                    animate('0.5s ease',
                        style({ opacity: 0 }))
                ])
            ]),
            state('false', style({ opacity: 0 })),
            transition('undefined => false', [
                style({ opacity: 0 })
            ]),
        ])
    ]
})
export class SoranaToastNotificationComponent implements OnInit, OnChanges {
    @Input() content: string;
    @Input() visible: boolean;
    @Input() width: number;

    @ViewChild('soranaToastNotification') notificationElement: ElementRef;
    @ViewChild('soranaToastNotificationContent') contentElement: ElementRef;

    windowWidth: number;

    constructor() {
        this.visible = false;
    }

    ngOnInit(): void {
        this.getWindowSize();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.visible) {
            if (changes.visible.currentValue === false
                && changes.visible.previousValue === true && this.notificationElement) {
                this.contentElement.nativeElement.value = '';
                this.content = '';
            }
        }
    }

    @HostListener('window:resize', ['$event'])
    getWindowSize() {
      this.windowWidth = window.innerWidth;
    }
}
