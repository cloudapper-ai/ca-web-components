import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { CaChatBoxComponent } from './components/chat-components/ca-chat-box/ca-chat-box.component';
import { ChatItemComponent } from './components/chat-components/chat-item/chat-item.component';
import { SuggestionItemComponent } from './components/chat-components/suggestion-item/suggestion-item.component';
import { ChatPopupContainerComponent } from './components/ca-chat-popup/ca-chat-popup-container.component';
import { MarkdownModule } from 'ngx-markdown';
import { createCustomElement } from '@angular/elements';
import { CAChatContainer } from './components/ca-chat-container/ca-chat-container.component';
import { ChatActionComponent } from './components/chat-components/chat-action/chat-action.component';
import { VideoRecordingModule } from './components/shared-components/video-recording/video-recording.module';
import { IframePreviewComponent } from './components/shared-components/iframe-preview/iframe-preview.component';
import { HttpClientModule } from '@angular/common/http';
import { TOKEN_FILE_SERVICE } from './data-layer/interfaces/injectable-token.token';
import { FileDataService } from './data-layer/file-service.data-service';

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
    HttpClientModule,
    BrowserAnimationsModule,
    ChatActionComponent,
    VideoRecordingModule,
    IframePreviewComponent,
    MarkdownModule.forRoot()
  ],
  providers: [
    { provide: TOKEN_FILE_SERVICE, useClass: FileDataService }
  ]
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
