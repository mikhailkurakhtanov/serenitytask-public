import { Component, EventEmitter, Input, Output } from "@angular/core";
import { trigger, transition, sequence, animate, style, state } from "@angular/animations";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { SoranaPopupButtonType } from "src/models/enums/sorana-popup-button-type.enum";

@Component({
  selector: 'sorana-simple-popup',
  templateUrl: 'sorana-simple-popup.component.html',
  styleUrls: ['sorana-simple-popup.component.css'],
  animations: [
    trigger('changePopupState', [
      transition('* => true', [
        style({ transform: 'translateY(-50%) scale(0.5)', display: 'block' }),
        sequence([
          animate('0.5s ease',
            style({ opacity: 1, transform: 'translateY(-50%) scale(1)' }))
        ])
      ]),
      state('true', style({ opacity: 1, transform: 'translateY(-50%) scale(1)', display: 'block' })),
      transition('true => false', [
        sequence([
          animate('0.5s ease',
            style({ opacity: 0 }))
        ]),
        state('false', style({ opacity: 0, transform: 'translateY(-50%) scale(0.5)', display: 'none' }))
      ])
    ])
  ]
})
export class SoranaSimplePopupComponent {
  @Input() maxWidth: number;
  @Input() visible: boolean;
  @Input() zIndex: number;
  @Input() buttonType: SoranaPopupButtonType;

  @Input() title: string;
  @Input() set content(value: string) {
    if (value) {
      this.formattedContent = value.indexOf('\n') >= 0 ? value.replace(/\n/g , "<br>") : value;
    }
  };

  get soranaPopupButtonTypeBase(): typeof SoranaPopupButtonType {
    return SoranaPopupButtonType;
  }

  formattedContent: string;

  @Output() result: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() isPopupShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

  closePopupIcon = faTimes;

  constructor() {
    this.maxWidth = 0;
    this.visible = false;
    this.buttonType = SoranaPopupButtonType.Desicion;
  }
}