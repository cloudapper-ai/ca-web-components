import { animate, style, transition, trigger } from "@angular/animations";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MarkdownService } from "ngx-markdown";
import { BehaviorSubject } from "rxjs";
import { ChatConstants } from "../../../models/chat-constants.model";
import { ActionAttachmentAttributes, ActionImageDataAttributes, ActionReadPinAttributes, ActionScheduleAttributes, ChatMessage, EnumChatMessagePreviewType } from "../../../models/chat-message.model";
import { ChatColorProfile } from "../../../models/chat-ui.model";
import { isVimeoLink, isYouTubeLink, getFileExtension, isAnImage, getVimeoEmbedUrl, getYoutubeEmbedUrl, isValidYouTubeLink } from "../../../helpers/attachment-helpers.helper";
import { RESULT } from "../../../models/result.model";
import { Assets } from "../../../models/assets.model";
import { FileInformation } from "../../../models/file-data.model";

@Component({
    selector: 'chat-item',
    templateUrl: './chat-item.component.html',
    styleUrls: ['./chat-item.component.css'],
    animations: [
        trigger('item', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate(150, style({ opacity: 1 }))
            ]),
            transition(':leave', [
                style({ opacity: 1 }),
                animate(100, style({ opacity: 0 }))
            ])
        ])
    ]
})
export class ChatItemComponent implements OnInit {
    protected Assets = Assets;
    constructor(private mdService: MarkdownService) { }

    ngOnInit(): void {
        this.mdService.renderer.image = (href, title, text) => {

            return `
                <div class="linked-messages">
                    <a target="_blank" href="${href}">
                        <img src="${href}" alt="${text}" >
                    </a>
                </div>
            `;
        };

        this.mdService.renderer.link = (href: string, title: string, text: string) => {
            const ext = getFileExtension(href);
            if (isVimeoLink(href)) {
                return `
                            <div class="video-attachment">
                                <iframe src="${getVimeoEmbedUrl(href)}" frameborder="0" allowfullscreen></iframe>

                            </div>
                        `
            } else if (isYouTubeLink(href) && isValidYouTubeLink(href)) {
                return `
                            <div class="video-attachment">
                                <iframe src="${getYoutubeEmbedUrl(href)}" 
                                 frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                            </div>
                        `;
            } else if (ext && isAnImage(ext)) {
                return `
                    <div class="linked-messages">
                        <a target="_blank" href="${href}">
                            <img src="${href}" alt="${text}" >
                        </a>
                    </div>
                `;
            } else {
                return `<a target="_blank" href=${href}>${title ?? text}</a>`
            }

        }
    }

    protected trackChoice(index: number, choice: string) {
        return `${index}-${choice}`;
    }

    protected trackAttachment(index: number, attachment: any) {
        return index
    }

    protected MessagePreviewTypes = EnumChatMessagePreviewType;

    protected userColorProfile: ChatColorProfile = new ChatColorProfile('#38383b', '#0e1221', '#c7c7c9')
    protected botColorProfile: ChatColorProfile = new ChatColorProfile('#1a1a9c', '#0e1221', '#FFFFFF')

    @Input() user: string = 'user0123'
    @Input() bot: string = 'AI Assistant'
    @Input()
    set colorProfiles(value: Record<string, ChatColorProfile>) {
        if (value[ChatConstants.UserId]) {
            this.userColorProfile = value[ChatConstants.UserId];
        }

        if (value[ChatConstants.BotId]) {
            this.botColorProfile = value[ChatConstants.BotId];
        }
    }

    protected isBotReply: boolean = false;

    @Input() allowActionInteraction: boolean = false;

    private _message: ChatMessage = new ChatMessage('', '', '');
    @Input()
    set message(value: ChatMessage) {
        this._message = value;
        this.isBotReply = value.userId === ChatConstants.BotId;
    }

    get message(): ChatMessage {
        return this._message;
    }

    @Output() suggestionSelected: BehaviorSubject<{
        message: string,
        queryText: string
    } | undefined> = new BehaviorSubject<{
        message: string,
        queryText: string
    } | undefined>(undefined);
    @Output() actionReplyReceived: EventEmitter<{
        reply: string,
        type: EnumChatMessagePreviewType
    }> = new EventEmitter();
    @Output() searchScheduleRequest: EventEmitter<string> = new EventEmitter();
    @Output() fileSubmitted: EventEmitter<{
        files: FileInformation[],
        subscriber: BehaviorSubject<FileInformation | undefined>
    }> = new EventEmitter();
    @Output() recordVideoRequested: EventEmitter<{
        attribute: ActionAttachmentAttributes,
        subject: BehaviorSubject<File | null>
    }> = new EventEmitter();
    @Output() openAppointmentWindow = new EventEmitter<{
        attribute: ActionScheduleAttributes,
        subject: BehaviorSubject<RESULT<boolean>>
    }>()

    @Output() capturePhotoRequested = new EventEmitter<{
        attribute: ActionImageDataAttributes,
        subject: BehaviorSubject<File | undefined>
    }>()

    @Output() geolocationReceived = new EventEmitter<{ lat: number, lng: number }>();

    @Output() retryRequested: EventEmitter<void> = new EventEmitter();
    @Output() requestCodeScan: EventEmitter<void> = new EventEmitter();
    @Output() requestPin: EventEmitter<ActionReadPinAttributes> = new EventEmitter();
    @Output() requestFacescan: EventEmitter<{
        setting: ActionImageDataAttributes,
        subject: BehaviorSubject<File | undefined>
    }> = new EventEmitter();

    protected onSuggestionSelected(param: {
        message: string,
        queryText: string
    } | undefined) {
        this.suggestionSelected.next(param);
    }

    protected onActionReplied(param: { reply: string, type: EnumChatMessagePreviewType }) {
        this.actionReplyReceived.next(param)
    }

    protected onRequestSearchSchedule(string: string) {
        this.searchScheduleRequest.next(string);
    }

    protected onFileSelected(param: {
        files: FileInformation[],
        subscriber: BehaviorSubject<FileInformation | undefined>
    }) {
        this.fileSubmitted.next(param);
    }

    protected onRecordVideoRequested(param: {
        attribute: ActionAttachmentAttributes,
        subject: BehaviorSubject<File | null>
    }) {
        this.recordVideoRequested.next(param);
    }
    protected onOpenAppointmentWindowRequest(param: {
        attribute: ActionScheduleAttributes,
        subject: BehaviorSubject<RESULT<boolean>>
    }) {
        this.openAppointmentWindow.next(param);
    }

    protected onCapturePhotoRequested(event: {
        attribute: ActionImageDataAttributes,
        subject: BehaviorSubject<File | undefined>
    }) {
        this.capturePhotoRequested.next(event);
    }

    protected retryClicked() {
        this.retryRequested.next();
    }

    protected onGeolocationReceived(data: { lat: number, lng: number }) {
        this.geolocationReceived.next(data);
    }

    protected onRequestCodeScan() {
        this.requestCodeScan.next();
    }

    protected onRequestPin(data: ActionReadPinAttributes) { this.requestPin.next(data); }

    protected getLengthRange(number: number) {
        return Array.from({ length: number }, (_, index) => index);
    }

    protected onRequestFaceScan(data: {
        setting: ActionImageDataAttributes,
        subject: BehaviorSubject<File | undefined>
    }) { this.requestFacescan.next(data); }
}