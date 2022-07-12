import { Component, HostListener, OnInit } from '@angular/core';
import { animate, sequence, state, style, transition, trigger } from '@angular/animations';
import { faBook } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'non-logged-in-header',
  templateUrl: 'non-logged-in.header.component.html',
  styleUrls: ['non-logged-in.header.component.css'],
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
export class NonLoggedInHeaderComponent implements OnInit {
  isLoginFormVisible: boolean;
  isRegisterFormVisible: boolean;
  playRegisterButtonAnimation: boolean;
  isGuideShouldBeVisible: boolean;

  guideIcon = faBook;

  windowWidth: number;

  constructor() {
    this.isGuideShouldBeVisible = false;
  }

  ngOnInit(): void {
    this.getWindowSize();
  }

  @HostListener('window:resize', ['$event'])
  getWindowSize() {
    this.windowWidth = window.innerWidth;
  }

  showLoginForm() {
    window.scrollTo(0, 0);
    this.isLoginFormVisible = true;
  }

  showRegisterForm() {
    window.scrollTo(0, 0);
    this.isRegisterFormVisible = true;
  }
}
