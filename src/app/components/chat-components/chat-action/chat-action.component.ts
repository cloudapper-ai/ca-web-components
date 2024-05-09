/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ChoiceAttributePipe } from "./chat-action.pipes";
import { ChatChoiceComponent } from "./chat-choice/chat-choice.component";
import { ChatRecordComponent } from "./chat-record/chat-record.component";
import { ChatUploadComponent } from "./chat-upload/chat-upload.component";
import { BehaviorSubject } from "rxjs";
import { ChatSchedularComponent } from "./chat-scheduler/chat-schedular.component";
import { ChatAudioComponent } from "./chat-audio/chat-audio.component";
import { ChatVideoComponent } from "./chat-video/chat-video.component";
import { EnumChatActionTypes, ChatUIActionData, ActionAttachmentAttributes, ActionScheduleAttributes, EnumChatMessagePreviewType, ActionImageDataAttributes, ActionReadPinAttributes } from "../../../models/chat-message.model";
import { RESULT } from "../../../models/result.model";
import { FileInformation } from "../../../models/file-data.model";
import { ChatPhotoComponent } from "./chat-photo/chat-photo.component";
import { ChatLocationComponent } from "./chat-location/chat-location.component";
import { ChatScanComponent } from "./chat-scan/chat-scan.component";
import { ChatPinComponent } from "./chat-pin/chat-pin.component";

@Component({
    selector: 'chat-action',
    templateUrl: './chat-action.component.html',
    styleUrls: ['./chat-action.component.css'],
    standalone: true,
    imports: [CommonModule, ChatPinComponent, ChatScanComponent, ChatPhotoComponent, ChatLocationComponent, ChatSchedularComponent, ChatVideoComponent, ChatUploadComponent, ChatRecordComponent, ChoiceAttributePipe, ChatChoiceComponent, ChatAudioComponent]
})
export class ChatActionComponent {

    protected ChatActionTypes = EnumChatActionTypes

    @Input() primaryColor: string = '#215484';

    @Input() action: ChatUIActionData = <ChatUIActionData>{ ActionType: EnumChatActionTypes.None }

    protected trackChoice(index: number, choice: string) {
        return `${index}-${choice}`;
    }

    protected PreviewTypes = EnumChatMessagePreviewType;
    @Output() replyReceived: EventEmitter<{
        reply: string,
        type: EnumChatMessagePreviewType
    }> = new EventEmitter();
    protected onSubmitReply(reply: string, type?: EnumChatMessagePreviewType) {
        this.replyReceived.next({
            reply: reply,
            type: type ? type : EnumChatMessagePreviewType.Default
        })
    }

    @Output() fileSubmitted: EventEmitter<{
        files: FileInformation[],
        subscriber: BehaviorSubject<FileInformation | undefined>
    }> = new EventEmitter();
    protected onFileSelected(event: {
        files: FileInformation[],
        subscriber: BehaviorSubject<FileInformation | undefined>
    }) { this.fileSubmitted.next(event); }

    @Output() recordVideoRequested = new EventEmitter<{
        attribute: ActionAttachmentAttributes,
        subject: BehaviorSubject<File | null>
    }>()

    protected startRecordingVideo(subject: BehaviorSubject<File | null>) {
        if (this.action.ActionAttachmentAttributes)
            this.recordVideoRequested.next({ subject: subject, attribute: this.action.ActionAttachmentAttributes });
    }

    @Output() openAppointmentWindow = new EventEmitter<{
        attribute: ActionScheduleAttributes,
        subject: BehaviorSubject<RESULT<boolean>>
    }>()

    protected onOpenAppointmentWindowRequest(param: {
        attribute: ActionScheduleAttributes,
        subject: BehaviorSubject<RESULT<boolean>>
    }) {
        this.openAppointmentWindow.next(param);
    }

    @Output() scheduleRequest: EventEmitter<string> = new EventEmitter();
    protected onReceiveScheduleRequest(message: string) {
        this.scheduleRequest.next(message)
    }

    @Output() capturePhotoRequested = new EventEmitter<{
        attribute: ActionImageDataAttributes,
        subject: BehaviorSubject<File | undefined>
    }>()
    protected onPhotoCaptureRequested(event: BehaviorSubject<File | undefined>) {
        this.capturePhotoRequested.next({
            attribute: this.action.CaptureImageDataAttributes || { DisableSwitchingCamera: false, IsDefaultToFrontCamera: true },
            subject: event
        })
    }

    @Output() geoLocationReceived: EventEmitter<{ lat: number, lng: number }> = new EventEmitter();
    protected onGeoLocationReceived(data: { lat: number, lng: number }) {
        this.geoLocationReceived.next(data);
    }

    @Output() requestCodeScan: EventEmitter<void> = new EventEmitter();
    protected onRequestCodeScan() {
        this.requestCodeScan.next();
    }

    @Output() requestPin = new EventEmitter<ActionReadPinAttributes>();
    protected onRequestPin(data: ActionReadPinAttributes) {
        this.requestPin.next(data);
    }
}