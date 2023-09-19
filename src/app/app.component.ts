import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ChatContainerComponent } from './components/ca-chat-container/ca-chat-container.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    if(this.chatContainer) { 
      this.chatContainer.welcomemessages = [
        'Hi, I am Raven. How can I help you today?',
        'Hi, I am Raven. May be I can help you search quickly.',
        'Hi, I am Raven. I can help you surfing the contents of this website.',
      ]
      this.chatContainer.suggestionmessages = [
        "I am looking for Facily management software",
        "I am a UKG Ready customer. Looking for a simple Clock in/out solution."
      ]
      // this.chatContainer.cancelOnTouchOutside = true;
    }
  }
  @ViewChild('chatContainer') chatContainer?: ChatContainerComponent;


}
