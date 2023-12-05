import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { CaChatBoxComponent } from './components/ca-chat-box/ca-chat-box.component';
import { ChatItemComponent } from './components/chat-item/chat-item.component';
import { SuggestionItemComponent } from './components/suggestion-item/suggestion-item.component';
import { ChatPopupContainerComponent } from './components/ca-chat-popup/ca-chat-popup-container.component';
import { MarkdownModule } from 'ngx-markdown';
import { createCustomElement } from '@angular/elements';
import { CAChatContainer } from './components/ca-chat-container/ca-chat-container.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatItemComponent,
    SuggestionItemComponent,
    CaChatBoxComponent,
    ChatPopupContainerComponent,
    CAChatContainer
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MarkdownModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule implements DoBootstrap {
  constructor(injector: Injector) {
    const elemOne = createCustomElement(ChatPopupContainerComponent, { injector: injector })
    customElements.define('chat-popup-container', elemOne);

    const elemTwo = createCustomElement(CAChatContainer, { injector: injector })
    customElements.define('chat-container', elemTwo);
  }
  ngDoBootstrap(appRef: ApplicationRef): void {

  }
}
