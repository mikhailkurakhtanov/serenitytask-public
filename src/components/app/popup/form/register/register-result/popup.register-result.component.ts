import { animate, sequence, state, style, transition, trigger } from '@angular/animations';
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'popup-register-result',
  templateUrl: 'popup.register-result.component.html',
  styleUrls: ['popup.register-result.component.css'],
  animations: [
    trigger('changeConfirmButtonState', [
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
export class PopupRegisterResultComponent {
  @Input() isRegisterResultPopupVisible: boolean;
  @Input() createdUserEmail: string;

  @Output() isRegisterFormShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

  playConfirmButtonAnimation: boolean;
}
