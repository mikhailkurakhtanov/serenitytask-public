import { trigger, transition, sequence, animate, style, state } from '@angular/animations';
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'popup-tac',
  templateUrl: 'popup.tac.component.html',
  styleUrls: ['popup.tac.component.css'],
  animations: [
    trigger('changeButtonState', [
      transition('* => true', [
          sequence([
            animate('0.25s ease',
                style({ transform: 'scale(1.075)' }))
              ])
          ]),
          state('true', style({ transform: 'scale(1.075)' })),
          transition('true => false', [
              sequence([
                  animate('0.25s ease',
                  style({ transform: 'scale(1)' }))
              ]),
              state('false', style({ transform: 'scale(1)' }))
          ])
      ])
  ]
})
export class PopupTermsAndConditionsFormComponent {
  @Input() isTermsAndConditionsFormVisible: boolean;
  @Output() areTermsAndConditionsAgreed: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isTermsAndConditionsFormShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

  playAcceptButtonAnimation: boolean;
  playDeclineButtonAnimation: boolean;

  accept() {
    this.areTermsAndConditionsAgreed.emit(true);
    this.isTermsAndConditionsFormShouldBeHidden.emit(true);
  }

  decline() {
    this.areTermsAndConditionsAgreed.emit(false);
    this.isTermsAndConditionsFormShouldBeHidden.emit(true);
  }
}
