import { animate, sequence, state, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'non-logged-in-body-and-footer',
  templateUrl: 'non-logged-in.body-and-footer.component.html',
  styleUrls: ['non-logged-in.body-and-footer.component.css'],
  animations: [
    trigger('changeRegisterButtonState', [
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
export class NonLoggedInBodyAndFooterComponent implements OnInit {
  isRegisterFormVisible: boolean;
  playRegisterButtonAnimation: boolean;

  windowWidth: number;

  ngOnInit(): void {
    this.getWindowSize();
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  applyFeaturesStyling(hoveredFeature: any) {
    let featuresElements = document.getElementsByClassName('feature') as HTMLCollectionOf<HTMLElement>;
    if (featuresElements.length > 0) {
      for (let index = 0; index != featuresElements.length; index++) {
        if (featuresElements[index].id != hoveredFeature.target.id) {
          featuresElements[index].style.opacity = '25%';
        }
      }
    }
  }

  rollbackFeaturesStyling() {
    let featuresElements = document.getElementsByClassName('feature') as HTMLCollectionOf<HTMLElement>;
    if (featuresElements.length > 0) {
      for (let index = 0; featuresElements.length - 1; index++) {
        featuresElements[index].style.opacity = '100%';
      }
    }
  }

  showRegisterForm() {
    window.scrollTo(0, 0);
    this.isRegisterFormVisible = true;
  }
}
