import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { CaChatBoxComponent } from './components/ca-chat-box/ca-chat-box.component';
import { ChatItemComponent } from './components/chat-item/chat-item.component';
import { SuggestionItemComponent } from './components/suggestion-item/suggestion-item.component';
import { ChatContainerComponent } from './components/ca-chat-container/ca-chat-container.component';
import { MarkdownModule } from 'ngx-markdown';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [
    AppComponent,
    ChatItemComponent,
    SuggestionItemComponent,
    CaChatBoxComponent,
    ChatContainerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MarkdownModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(injector: Injector) {
    const elem = createCustomElement(ChatContainerComponent, { injector: injector})
    customElements.define('chat-container', elem);
  }
}
