import { Component, EventEmitter, HostListener, Input, OnInit, Output } from "@angular/core";
import { GuideSection } from "src/models/enums/guide-section.enum";
import { faBars } from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: 'guide',
    templateUrl: 'guide.component.html',
    styleUrls: ['guide.component.css']
})
export class GuideComponent implements OnInit {
    @Input() isPopupVisible: boolean;
    @Output() isPopupShouldBeHidden: EventEmitter<boolean> = new EventEmitter<boolean>();

    get guideSectionBase(): typeof GuideSection {
        return GuideSection;
    }

    selectedSection: GuideSection;
    windowWidth: number;

    isMobileGuideMenuVisible: boolean;

    menuIcon = faBars;

    constructor() {
        this.isPopupVisible = false;
        this.isMobileGuideMenuVisible = false;
        this.selectedSection = GuideSection.FirstStep;
    }

    ngOnInit(): void {
        this.getWindowSize();
    }

    @HostListener('window:resize', ['$event'])
    getWindowSize() {
        this.windowWidth = window.innerWidth;
    }

    selectSection(selectedSection: GuideSection) {
        if (this.windowWidth < 1000) this.isMobileGuideMenuVisible = false;
        this.selectedSection = selectedSection;
    }
}