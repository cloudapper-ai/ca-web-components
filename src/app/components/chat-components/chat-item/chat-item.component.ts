import { animate, style, transition, trigger } from "@angular/animations";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MarkdownService } from "ngx-markdown";
import { BehaviorSubject } from "rxjs";
import { ChatConstants } from "../../../models/chat-constants.model";
import { ActionAttachmentAttributes, ActionImageDataAttributes, ActionScheduleAttributes, ChatMessage, EnumChatMessagePreviewType } from "../../../models/chat-message.model";
import { ChatColorProfile } from "../../../models/chat-ui.model";
import { isVimeoLink, isYouTubeLink, getFileExtension, isAnImage, isAVideo, VideoFile, isAnAudio, AudioFile, isAPDF, PdfFile, isADocument, DocFile, isAnHtml, HtmlFile, getVimeoEmbedUrl, getYoutubeEmbedUrl, isValidYouTubeLink } from "../../../helpers/attachment-helpers.helper";
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
            if (isVimeoLink(href)) {
                return `
                            <div class="video-attachment">
                                <iframe src="${getVimeoEmbedUrl(href)}" frameborder="0" allowfullscreen></iframe>

                            </div>
                        `
            } else if (isYouTubeLink(href) && isValidYouTubeLink(href)) {
                return `
                            <div class="video-attachment">
                                <iframe src="${getYoutubeEmbedUrl(href)}" frameborder="0" allowfullscreen></iframe>
                            </div>
                        `
            } else {
                const extension = getFileExtension(href);
                if (extension) {
                    if (isAnImage(extension)) {
                        return `
                        <div class="linked-messages">
                            <a target="_blank" href="${href}">
                                <img src="${href}" alt="${text}" >
                            </a>
                        </div>
                    `;
                    } else if (isAVideo(extension)) {
                        if (extension === 'mp4') {
                            return `
                            <div class="video-attachment">
                                <video controls>
                                    <source
                                        src="${href}"
                                        type="video/${extension}">
                                    Your browser does not support the video tag.
                                </video>

                            </div>
                        `
                        } else {
                            return `
                            <div class="attachment-messages">
                                <a target="_blank" href="${href}">
                                    <div class="message-body">
                                        <img src="${VideoFile}" alt="${text}">
                                        <span>${title ?? text}</span>
                                    </div>
                                </a>
                            </div>                        
                            `
                        }

                    } else if (isAnAudio(extension)) {
                        if (extension === 'mp3') {
                            return `
                                <div class="audio-attachment">
                                    <audio controls>
                                        <source src="${href}">
                                        Your browser does not support the video tag.
                                    </audio>

                                </div>
                            `
                        } else {
                            return `
                            <div class="attachment-messages">
                                <a target="_blank" href="${href}">
                                    <div class="message-body">
                                        <img src="${AudioFile}" alt="${text}">
                                        <span>${title ?? text}</span>
                                    </div>
                                </a>
                            </div>                        
                            `
                        }
                    } else if (isAPDF(extension)) {
                        return `
                            <div class="attachment-messages">
                                <a target="_blank" href="${href}">
                                    <div class="message-body">
                                        <img src="${PdfFile}" alt="${text}">
                                        <span>${title ?? text}</span>
                                    </div>
                                </a>
                            </div>                        
                            `
                    } else if (isADocument(extension)) {
                        return `
                            <div class="attachment-messages">
                                <a target="_blank" href="${href}">
                                    <div class="message-body">
                                        <img src="${DocFile}" alt="${text}">
                                        <span>${title ?? text}</span>
                                    </div>
                                </a>
                            </div>                        
                            `
                    } else if (isAnHtml(extension)) {
                        return `
                            <div class="attachment-messages">
                                <a target="_blank" href="${href}">
                                    <div class="message-body">
                                        <img src="${HtmlFile}" alt="${text}">
                                        <span>${title ?? text}</span>
                                    </div>
                                </a>
                            </div>                        
                            `
                    }
                }

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

    @Output() retryRequested: EventEmitter<void> = new EventEmitter();

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
}