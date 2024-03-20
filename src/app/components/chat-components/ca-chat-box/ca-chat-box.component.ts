import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatConstants } from '../../../models/chat-constants.model';
import { ActionAttachmentAttributes, ActionScheduleAttributes, ChatMessage, ChatUIActionData } from '../../../models/chat-message.model';
import { ChatBoxInputs, ChatWindowColorProfile } from '../../../models/chat-ui.model';
import { RESULT } from '../../../models/result.model';
import { uuidv4 } from '../../../helpers/utils';
import { Assets } from 'src/app/models/assets.model';

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

    addActionReplyFromBot(id: string, message: string, action: ChatUIActionData) {
        const chatMessage = new ChatMessage(id, ChatConstants.BotId, message);
        chatMessage.action = action
        this.updateMessageQueue(chatMessage);
    }

    setReadyForUserReply(ready: boolean) {
        this.isLoading = !ready;
    }

    protected addReplyFromUser(message: string): boolean {
        const chatMessage = new ChatMessage(uuidv4(), ChatConstants.UserId, message);
        return this.updateMessageQueue(chatMessage);
    }

    addFileResponseFromUser(url: string, file: File) {
        this.postUserReply(`[${file.name}](${url})`)
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
    protected action?: ChatUIActionData;

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
                // if (messages[oldMessageIndex].message === newMessage.message) { return false; }
                messages[oldMessageIndex].updateCount += 1;
                messages[oldMessageIndex].message = newMessage.message;
                messages[oldMessageIndex].warning = newMessage.warning;
                messages[oldMessageIndex].action = newMessage.action;
            } else {
                messages.push(newMessage);
            }
        }

        this.action = messages.length ? messages[messages.length - 1].action : undefined;

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


    submitMessageWithoutShowing(message: string) {
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

    @Output() submitFileMessage: EventEmitter<File> = new EventEmitter();

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

    protected onScheduleSearchRequested(message: string) {
        if (this.isLoading) { return; }
        this.submitMessageWithoutShowing(message)
    }

    // #region video record control
    protected isRecordingVideo: boolean = false;
    protected videoRecordAttributes?: ActionAttachmentAttributes;
    protected videoRecordObserver?: BehaviorSubject<File | null>;
    protected onRecordVideoRequested(param: {
        attribute: ActionAttachmentAttributes,
        subject: BehaviorSubject<File | null>
    }) {
        this.videoRecordAttributes = param.attribute;
        this.videoRecordObserver = param.subject;
        this.isRecordingVideo = true;
    }

    protected cancelRecording() {
        this.isRecordingVideo = false;
        this.videoRecordObserver?.next(null);
    }

    protected onRecordCompleted(file: File) {
        this.isRecordingVideo = false;
        this.videoRecordObserver?.next(file);
    }

    // #endregion

    // #region make appointment controls
    protected isOpenAppointment: boolean = false;
    protected scheduleAttributes?: ActionScheduleAttributes;
    protected scheduleObserver?: BehaviorSubject<RESULT<boolean>>;
    protected onMakeAppointmentRequested(param: {
        attribute: ActionScheduleAttributes,
        subject: BehaviorSubject<RESULT<boolean>>
    }) {
        this.scheduleAttributes = param.attribute;
        this.scheduleObserver = param.subject;
        this.isOpenAppointment = true;
    }

    protected closeAppointment() {
        this.isOpenAppointment = false;
        this.scheduleAttributes = undefined;
        this.scheduleObserver?.next(RESULT.ok(true));
    }

    protected onErrorfromIframe(error: string) {
        this.scheduleObserver?.next(RESULT.error(new Error(error)));
        this.isOpenAppointment = false;
        this.scheduleAttributes = undefined;
    }
    // #endregion

    private fileUploadObserver?: BehaviorSubject<string | undefined> = undefined;
    protected onFileMessageReceived(param: {
        file: File,
        subscriber: BehaviorSubject<string | undefined>
    }) {
        if (!this.isLoading) {
            this.fileUploadObserver = param.subscriber;
            this.submitFileMessage.next(param.file);
        }
    }

    uploadFileFailed(reason: string) {
        this.fileUploadObserver?.next(reason);
        this.fileUploadObserver = undefined;
    }

    protected Assets = Assets;
}
