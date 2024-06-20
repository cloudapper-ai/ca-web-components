import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatConstants } from '../../../models/chat-constants.model';
import { ActionAttachmentAttributes, ActionImageDataAttributes, ActionReadPinAttributes, ActionScheduleAttributes, ChatMessage, ChatSuggestion, ChatUIActionData, EnumChatActionTypes, EnumChatMessagePreviewType } from '../../../models/chat-message.model';
import { ChatBoxInputs, ChatWindowColorProfile } from '../../../models/chat-ui.model';
import { RESULT } from '../../../models/result.model';
import { uuidv4 } from '../../../helpers/utils';
import { Assets } from '../../../models/assets.model';
import { FileInformation } from '../../../models/file-data.model';
import { CodeScanResult } from '../../shared-components/scan-code/scan-code.component';
import { EnumFaceDirection } from '../../shared-components/face-camera-lib/lib-models/face-enums.model';

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

    addReplyFromBot(id: string, message: string, suggestions?: string[], suggestionObjects?: ChatSuggestion[]) {
        const chatMessage = new ChatMessage(id, ChatConstants.BotId, message);
        chatMessage.suggestions = suggestions;
        chatMessage.suggestionObjects = suggestionObjects;
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

    protected addReplyFromUser(message: string, queryText?: string, style?: EnumChatMessagePreviewType): ChatMessage | undefined {
        const chatMessage = new ChatMessage(uuidv4(), ChatConstants.UserId, message);
        chatMessage.QueryText = queryText
        chatMessage.style = style ? style : EnumChatMessagePreviewType.Default;
        if (this.updateMessageQueue(chatMessage)) {
            return chatMessage
        } else {
            return undefined;
        }
    }

    addGeolocationResponseFromUser(data: { lat: number, lng: number }) {
        this.postUserReply(`${data.lat},${data.lng}`, undefined, EnumChatMessagePreviewType.Location);
    }

    addFileResponseFromUser(files: FileInformation[]) {
        let response = ''
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (i !== 0) { response += ';'; }
            // response += `[${file.file.name}](${file.url})`
            response += `${file.url}`
        }
        this.postUserReply(response, undefined, EnumChatMessagePreviewType.Attachment)
    }

    protected onRetryRequested() {
        if (this._lastQuery) {
            this.submitMessageWithoutShowing(this._lastQuery);
        }
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
    protected allowChatInput: boolean = true;
    protected ChatActionTypes = EnumChatActionTypes;
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
                messages[oldMessageIndex].suggestionObjects = newMessage.suggestionObjects;
                messages[oldMessageIndex].suggestions = newMessage.suggestions;
            } else {
                messages.push(newMessage);
            }
        }

        this.action = messages.length ? messages[messages.length - 1].action : undefined;;
        if (this.action) {
            this.allowChatInput = this.action.ActionType === EnumChatActionTypes.ShowRecord || this.action.ActionType === EnumChatActionTypes.ShowRecords || this.action.IsOptional
        } else {
            this.allowChatInput = true;
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

    private _lastQuery?: string;
    submitMessageWithoutShowing(message: string) {
        setTimeout(() => {
            this.addLoadingMessage();
            this.setReadyForUserReply(false);
            this._lastQuery = message;
            this.userReplySubmitted.next(message);
        }, 250);
        if (this.chatUserInput) {
            this.chatUserInput.nativeElement.value = '';
        }
    }

    private postUserReply(message: string, queryText?: string, style: EnumChatMessagePreviewType = EnumChatMessagePreviewType.Default) {
        let newMessage = message;

        const lines = newMessage.split('\n').map(x => x.trim()).filter(x => x.length);
        if (lines.length) {
            newMessage = lines.join('<br>')
        }

        const chatMessage = this.addReplyFromUser(newMessage, queryText, style);
        if (chatMessage) {

            setTimeout(() => {
                this.addLoadingMessage();
                this.setReadyForUserReply(false);
                this._lastQuery = chatMessage.QueryText;
                this.userReplySubmitted.next(chatMessage.QueryText);
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

    @Output() submitFileMessage: EventEmitter<FileInformation[]> = new EventEmitter();

    @Output()
    cancelUserRequest: EventEmitter<void> = new EventEmitter();

    protected onCancelUserRequest() {
        this.cancelUserRequest.next();
    }

    @Output()
    userReplySubmitted: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

    protected onSuggsetionSelected(param: {
        message: string,
        queryText: string
    } | undefined) {
        if (param && param.message.length > 0) {
            this.postUserReply(param.message, param.queryText);
        }
    }
    protected onActionSelected(param: {
        reply: string,
        type: EnumChatMessagePreviewType
    }) {
        // if (message && message.length > 0) {
        //     this.postUserReply(message);
        // }
        this.postUserReply(param.reply, undefined, param.type)
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

    protected onRecordCompleted(file: { data: Blob, name: string }) {
        this.isRecordingVideo = false;
        this.videoRecordObserver?.next(new File([file.data], file.name));
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

    private fileUploadObserver?: BehaviorSubject<FileInformation | undefined> = undefined;
    protected onFileMessageReceived(param: {
        files: FileInformation[],
        subscriber: BehaviorSubject<FileInformation | undefined>
    }) {
        if (!this.isLoading) {
            this.fileUploadObserver = param.subscriber;
            this.submitFileMessage.next(param.files);
        }
    }

    updateFileInformation(file: FileInformation) {
        this.fileUploadObserver?.next(file);
    }

    protected Assets = Assets;


    protected isPhotoCapturing: boolean = false;
    protected photoAttributes?: ActionImageDataAttributes;
    protected capturePhotoObserver?: BehaviorSubject<File | undefined> = undefined;
    protected openCapturePhoto(param: {
        attribute: ActionImageDataAttributes,
        subject: BehaviorSubject<File | undefined>
    }) {
        this.photoAttributes = param.attribute;
        this.capturePhotoObserver = param.subject;
        this.isPhotoCapturing = true;
    }
    protected closeCapturePhoto() {
        this.isOpenAppointment = false;
        this.photoAttributes = undefined;
        this.capturePhotoObserver?.next(undefined);
    }

    protected onCaptureCompleted(file: File) {
        this.capturePhotoObserver?.next(file);
        this.isOpenAppointment = false;
        this.photoAttributes = undefined;
    }

    // #region scanning barcode
    protected isScanningCode: boolean = false
    protected scanResult?: CodeScanResult;
    protected onCodeScanRequested() {
        this.scanResult = undefined;
        this.isScanningCode = true;
    }

    protected onScanCompleted(result: CodeScanResult) {
        this.scanResult = result;
        this.isScanningCode = true;
        this.postUserReply(result.code, undefined, EnumChatMessagePreviewType.Code);
    }

    protected closeCodeScanning() {
        this.scanResult = undefined;
        this.isScanningCode = false;
    }
    // #endregion scanning barcode

    // #region request pin code
    protected isRequestingReadPin = false;
    protected pinSetting: ActionReadPinAttributes = <ActionReadPinAttributes>{
        Title: 'Enter your pin',
        PinLength: 4,
        IsAlphaNumericPin: false
    };
    protected onCanceledReadPin() {
        this.isRequestingReadPin = false;
    }

    protected onPinready(value: string) {
        this.postUserReply(value, undefined, EnumChatMessagePreviewType.Secret);
        this.isRequestingReadPin = false;
    }

    protected requestReadPin(setting: ActionReadPinAttributes) {
        this.pinSetting = setting;
        this.isRequestingReadPin = true;
    }
    // #endregion

    //#region request face scan
    protected isScanningFace: boolean = false;
    protected faceScanAttributes?: ActionImageDataAttributes;
    protected faceScanObserver?: BehaviorSubject<File | undefined>;
    protected FaceDirections = EnumFaceDirection;
    protected onRequestFaceScan(data: {
        setting: ActionImageDataAttributes,
        subject: BehaviorSubject<File | undefined>
    }) {
        this.faceScanAttributes = data.setting;
        this.faceScanObserver = data.subject;
        this.isScanningFace = true;
    }
    protected onFaceScanCanceled() {
        this.faceScanAttributes = undefined;
        this.faceScanObserver = undefined;
        this.isScanningFace = false;
    }
    protected onFaceScanCompleted(file: File) {
        this.faceScanObserver?.next(file);
        this.faceScanAttributes = undefined;
        this.faceScanObserver = undefined;
        this.isScanningFace = false;
    }
    //#endregion
}
