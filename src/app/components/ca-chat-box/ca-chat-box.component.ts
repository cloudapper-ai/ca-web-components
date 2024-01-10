import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatConstants } from 'src/app/models/chat-constants.model';
import { ChatMessage } from 'src/app/models/chat-message.model';
import { ChatBoxInputs, ChatWindowColorProfile } from 'src/app/models/chat-ui.model';
import { uuidv4 } from 'src/app/service-layer/utils';

@Component({
    selector: 'ca-chat-box',
    templateUrl: './ca-chat-box.component.html',
    styleUrls: ['./ca-chat-box.component.css']
})
export class CaChatBoxComponent {

    @Input() initialParameters: ChatBoxInputs = new ChatBoxInputs('CloudApper AI', 'user0123', 'AI Assistant', new ChatWindowColorProfile('#1960d1', '#ffffff', '#f2f2f2'), {}, false)

    addWarningfromBot(id: string, message: string) {
        const chatMessage = new ChatMessage(id, ChatConstants.BotId, message);
        chatMessage.warning = true;
        this.updateMessageQueue(chatMessage);
    }

    reset() {
        this.messages = [];
        this.setReadyForUserReply(true);
    }

    addReplyFromBot(id: string, message: string, suggestions?: string[]) {
        const chatMessage = new ChatMessage(id, ChatConstants.BotId, message);
        chatMessage.suggestions = suggestions;
        this.updateMessageQueue(chatMessage);
    }

    setReadyForUserReply(ready: boolean) {
        this.isLoading = !ready;
    }

    protected addReplyFromUser(message: string): boolean {
        const chatMessage = new ChatMessage(uuidv4(), ChatConstants.UserId, message);
        return this.updateMessageQueue(chatMessage);
    }

    protected addLoadingMessage() {
        const chatMessage = new ChatMessage(uuidv4(), ChatConstants.BotId, '');
        chatMessage.loading = true;
        this.updateMessageQueue(chatMessage);
    }

    protected trackBy(index: number, value: ChatMessage): string {
        return `${value.id}-${value.updateCount}`;
    }

    protected messages: ChatMessage[] = [];
    protected isLoading: boolean = false;

    private updateMessageQueue(newMessage: ChatMessage): boolean {
        if (this.isLoading) {
            if (newMessage.userId !== ChatConstants.BotId) {
                return false;
            }
        }

        const messages = [...this.messages];
        const loadingItemIndex = messages.findIndex(entry => entry.loading);
        if (loadingItemIndex !== -1) {
            // update the loading item with new message
            messages[loadingItemIndex] = newMessage;
        } else {
            // look for message that has the same id
            const oldMessageIndex = messages.findIndex(entry => entry.id === newMessage.id);
            if (oldMessageIndex !== -1) {
                if (messages[oldMessageIndex].message === newMessage.message) { return false; }
                messages[oldMessageIndex].updateCount += 1;
                messages[oldMessageIndex].message = newMessage.message;
                messages[oldMessageIndex].warning = newMessage.warning;
            } else {
                messages.push(newMessage);
            }
        }

        this.messages = messages;
        setTimeout(() => {
            if (this.chatbody) {
                this.chatbody.nativeElement.scroll({
                    top: this.chatbody.nativeElement.scrollHeight,
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }, 250);
        return true;
    }

    @ViewChild('chatUserInput') chatUserInput?: ElementRef;
    @ViewChild('chatbody') chatbody?: ElementRef;


    applyInitialMessage(message: string) {
        setTimeout(() => {
            this.addLoadingMessage();
            this.setReadyForUserReply(false);
            this.userReplySubmitted.next(message);
        }, 250);
        if (this.chatUserInput) {
            this.chatUserInput.nativeElement.value = '';
        }
    }

    private postUserReply(message: string) {
        let newMessage = message;

        const lines = newMessage.split('\n').map(x => x.trim()).filter(x => x.length);
        if (lines.length) {
            newMessage = lines.join('<br>')
        }

        if (this.addReplyFromUser(newMessage)) {

            setTimeout(() => {
                this.addLoadingMessage();
                this.setReadyForUserReply(false);
                this.userReplySubmitted.next(message);
            }, 500);
            if (this.chatUserInput) {
                this.chatUserInput.nativeElement.value = '';
                this.chatUserInput.nativeElement.style.height = '36px';
            }
        }
    }

    protected onSubmitReplyEvent() {
        if (this.chatUserInput) {
            const message = this.chatUserInput.nativeElement.value;
            if (message && message.length > 0) {
                this.postUserReply(message)
            }
        }
    }

    @Output()
    cancelUserRequest: EventEmitter<void> = new EventEmitter();

    protected onCancelUserRequest() {
        this.cancelUserRequest.next();
    }

    @Output()
    userReplySubmitted: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

    protected onSuggsetionSelected(message: string | undefined) {
        if (message && message.length > 0) {
            this.postUserReply(message);
        }
    }

    @Output() chatMinimizeRequestReceived: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    protected minimizeChatWindow() {
        this.chatMinimizeRequestReceived.next(true);
    }

    protected onInputChange(event: Event) {
        const element = event.target as HTMLTextAreaElement;
        if (element) {
            if (element.value.length > 0) {
                element.style.height = `${Math.min(160, Math.max(36, element.scrollHeight))}px`
            } else {
                element.style.height = '36px'
            }
        }
    }

    @Input() allowMinimize: boolean = true;
}
