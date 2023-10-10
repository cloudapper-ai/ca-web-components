import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ChatPopupContainerComponent } from './components/ca-chat-popup/ca-chat-popup-container.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  readonly array: number[] = []
  constructor() { 
    for(let i=0; i<100; i++) {
      this.array.push(i + 1)
    }
  }

  readonly welcomemessages = ['Hi, I am Raven. How can I help you today?',
  'Hi, I am Raven. May be I can help you search quickly.',
  'Hi, I am Raven. I can help you surfing the contents of this website.'];
  readonly suggestedmessages = [
    "I am looking for Facility management software",
    "I am a UKG Ready customer. Looking for a simple Clock in/out solution."
  ]

  ngAfterViewInit(): void {
    if(this.chatContainer) { 
      this.chatContainer.welcomemessages = this.welcomemessages
      this.chatContainer.suggestionmessages = this.suggestedmessages
    }
  }
  @ViewChild('chatContainer') chatContainer?: ChatPopupContainerComponent;


}
