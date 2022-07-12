import { trigger, transition, style, sequence, animate, state } from "@angular/animations";
import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: 'sorana-popup',
    templateUrl: 'sorana-popup.component.html',
    styleUrls: ['sorana-popup.component.css'],
    animations: [
        trigger('changePopupState', [
            transition('* => true', [
                style({ transform: 'translateY(-50%) scale(0.75)', display: 'block' }),
                sequence([
                    animate('0.5s ease',
                        style({ opacity: 1, transform: 'translateY(-50%) scale(1)' }))
                ])
            ]),
            state('true', style({ opacity: 1, transform: 'translateY(-50%) scale(1)', display: 'block' })),
            transition('true => false', [
                sequence([
                    animate('0.5s ease',
                        style({ opacity: 0, transform: 'translateY(-50%) scale(0.75)' }))
                ])
            ]),
            state('false', style({ opacity: 0, display: 'none' }))
        ])
    ]
})
export class SoranaPopupComponent implements OnChanges {
    @Input() visible: boolean;
    @Input() width: number;
    @Input() maxWidth: number;
    @Input() height: number;

    @Input() title: string;
    @Input() isTitleVisible: boolean;
    @Input() isCloseButtonVisible: boolean;
    @Input() isCloseOutsideClickAvailable: boolean;
    @Output() isPopupShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('popup') popupElement: ElementRef;

    closePopupIcon = faTimes;

    overlayWrapperElementId: string;

    constructor() {
        this.visible = false;
        this.isTitleVisible = true;
        this.isCloseOutsideClickAvailable = false;
    }

    @HostListener('window:resize', ['$event'])
    getWindowSize() {
        if (this.visible) {
            let overlayWrapperElements = document.getElementsByClassName('sorana-popup-overlay-wrapper') as HTMLCollectionOf<HTMLElement>;

            if (overlayWrapperElements.length > 0) {
                for (let index = 0; index < overlayWrapperElements.length; index++) {
                    overlayWrapperElements[index].style.width = window.innerWidth + 'px';
                    overlayWrapperElements[index].style.height = window.innerHeight + 'px';
                }
            }
        }
    }

    @HostListener('window:click', ['$event'])
    closePopupOnOutsideClick(event: any) {
        if (this.visible && event.path[0].classList.contains('sorana-popup-overlay-wrapper')
            && this.isCloseOutsideClickAvailable) {
            this.isPopupShouldBeHidden.emit();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.visible?.currentValue) {
            let overlayWrapperElement = document.createElement('div');
            let overlayWrapperElements = document.getElementsByClassName('sorana-popup-overlay-wrapper') as HTMLCollectionOf<HTMLElement>;
            this.overlayWrapperElementId = 'soranaPopupOverlayWrapper_' + overlayWrapperElements.length + 1;

            overlayWrapperElement.id = this.overlayWrapperElementId;
            overlayWrapperElement.classList.add('sorana-popup-overlay-wrapper');
            overlayWrapperElement.style.width = window.innerWidth + 'px';
            overlayWrapperElement.style.height = window.innerHeight + 'px';

            document.body.appendChild(overlayWrapperElement);
            document.body.style.overflow = 'hidden';
        } else {
            let overlayWrapperElement = document.getElementById(this.overlayWrapperElementId);
            if (overlayWrapperElement !== null) {
                document.body.style.overflow = 'visible';
                overlayWrapperElement.remove();
            }
        }
    }
}