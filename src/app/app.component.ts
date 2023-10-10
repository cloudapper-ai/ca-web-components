import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ChatPopupContainerComponent } from './components/ca-chat-popup/ca-chat-popup-container.component';
import { CAChatContainer } from './components/ca-chat-container/ca-chat-container.component';

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

    this.loadChatContainer();
  }
  @ViewChild('chatContainer') chatContainer?: ChatPopupContainerComponent;
  @ViewChild('chatsimple') chatSimple?: CAChatContainer;
  private getQueryParams(): Map<string, string> {
    var queryParams = new Map<string, string>();
    var queryString = window.location.search.slice(1);
    var queryStrings = queryString.split("&");

    for (var i = 0; i < queryStrings.length; i++) {
        var pair = queryStrings[i].split("=");
        queryParams.set(pair[0].toLowerCase(), decodeURIComponent(pair[1] || ""));
    }

    return queryParams;
}
readonly QUERY_PARAM_IDENTIFIER = "identifier";
readonly QUERY_PARAM_KNOWLEDGE_BASE_ID = "knowledgebaseid";

private loadChatContainer() {
  if(!this.chatSimple) { return ; }
  this.chatSimple.welcomemessages = [
        "Hi there. Welcome to CloudApper AI. How can I help you today?",
        "Hi there. I am an AI Assistant. I am here to help you today.",
        "Hi there. How may I assist you today?",
    ]
    const params = this.getQueryParams();   
    const identifier = params.get(this.QUERY_PARAM_IDENTIFIER);
    const knowledgebaseid = params.get(this.QUERY_PARAM_KNOWLEDGE_BASE_ID);
    if(identifier) {
      this.chatSimple.identifier = identifier;
    }

    if(knowledgebaseid) {
      this.chatSimple.knowledgebaseid = knowledgebaseid;
    }
}

}
