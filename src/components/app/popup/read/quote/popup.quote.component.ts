import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges, OnInit } from "@angular/core";
import { QuoteService } from "../../../../../services/api/quote.service";
import { Quote } from "../../../../../models/entities/quote.model";
import { Constants } from "src/components/constants";

@Component({
  selector: 'popup-quote',
  templateUrl: 'popup.quote.component.html',
  styleUrls: ['popup.quote.component.css']
})
export class PopupQuoteComponent {
  @Input() isPopupQuoteVisible: boolean;
  @Output() isPopupCreatePlantVisible: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('quoteContent') element: ElementRef;

  quote: Quote;

  constructor(private quoteService: QuoteService) {
    this.quoteService.getAny().subscribe(x => {
      this.quote = x;
    })
  }

  showCreatePlantForm() {
    this.isPopupQuoteVisible = false;
    this.isPopupCreatePlantVisible.emit();
  }

  playNotification() {
    let notificationSound = new Audio(Constants.systemSoundsUrl + 'notification_plant_die.mp3');
    notificationSound.play();
  }
}
