import { AfterViewInit, Component, HostListener, Input, OnChanges, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import { ChatConstants } from "../../models/chat-constants.model";
import { ChatBoxInputs, ChatColorProfile, ChatWindowColorProfile, EnumBubbleStyle, EnumWindowPosition } from "../../models/chat-ui.model";
import { CaChatBoxComponent } from "../chat-components/ca-chat-box/ca-chat-box.component";
import { uuidv4 } from "../../helpers/utils";
import { Subscription, takeWhile } from "rxjs";
import { IChatService } from "../../data-layer/interfaces/chat-service.interface";
import { ChatService } from "../../service-layer/chat-service.service";
import { DummyChatDataService } from "../../data-layer/dummy-chat-service.data-service";
import { ChatDataService } from "../../data-layer/chat-service.data-service";
import { RESULT } from "../../models/result.model";
import { ActionAttachmentAttributes, ChatSuggestion, ChatUIActionData, EnumChatActionTypes } from "../../models/chat-message.model";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { FileService } from "../../service-layer/file-service.service";
import { Assets } from "src/app/models/assets.model";

@UntilDestroy()
@Component({
    selector: 'ca-ai-chat-popup-container',
    templateUrl: './ca-chat-popup-container.component.html',
    styleUrls: [
        './ca-chat-popup-container.component.css',
        './ca-chat-box-container.component.css',
        './ca-chat-box-bubble-container.component.css',
    ],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class ChatPopupContainerComponent implements AfterViewInit, OnChanges {
    private chatDataService?: IChatService;
    private chatService?: ChatService;
    constructor(private fileService: FileService) {
        this.chatDataService = new DummyChatDataService();
        this.chatService = new ChatService(this.chatDataService!)

        this.setupChatWindowClass(this.windowposition);
        this.updateUserColorProfile()
        this.updateBotColorProfile()

    }

    private _windowWidth: number = 0;
    private get windowWidth(): number {
        return this._windowWidth;
    }

    private set windowWidth(value: number) {
        this._windowWidth = value;
        if (this.showChatWindow) {
            if (value > 480) {
                this.changeScrollState(!this.cancelontouchoutside)
            } else {
                this.changeScrollState(true)
            }
        } else {
            this.changeScrollState(true);
        }

    }

    @HostListener('window: resize', ['$event'])
    onResize(event: any) {
        this.windowWidth = window.innerWidth;
    }

    protected isBubbleDelayCompleted: boolean = false;

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.isBubbleDelayCompleted = true;
            if (this.bubbletext.trim().length > 0) {
                this.resetGlowEffect();
            }
        }, this.bubbledelay * 1000)
        this.windowWidth = window.innerWidth;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['identifier'] || changes['knowledgebaseId'] || changes['aiURL']) {
            if (this.identifier && this.identifier.trim().length > 0
                && this.instanceurl && this.instanceurl.trim()) {
                this.chatDataService = new ChatDataService(this.instanceurl.trim(), this.identifier.trim(), this.knowledgebaseid ? this.knowledgebaseid.trim() : '');
                this.fileService.updateEndpoint(this.instanceurl.trim(), this.identifier.trim())
            } else {
                this.chatDataService = new DummyChatDataService();
            }

            this.chatService = new ChatService(this.chatDataService!);
        }
    }

    private _bubblestyle: EnumBubbleStyle = EnumBubbleStyle.Callout;
    @Input()
    get bubblestyle(): EnumBubbleStyle { return this._bubblestyle; }
    set bubblestyle(value: EnumBubbleStyle) { this._bubblestyle = value; this.setupChatWindowClass(this.windowposition); }

    private _bubbletext: string = '';
    @Input()
    get bubbletext(): string {
        return this._bubbletext
    }

    set bubbletext(value: string) {
        this._bubbletext = value;
        if (value.trim().length > 0) {
            this.resetGlowEffect();
        }

    }

    @Input() bubblebackgroundcolor = '#edefef';
    @Input() bubbleforegroundcolor = '#414042';
    private _bubbledelay: number = 3;
    @Input()
    get bubbledelay(): number {
        return this._bubbledelay;
    }
    set bubbledelay(value: number) {
        if (value > 1) {
            this._bubbledelay = value;
        }
    }

    private _addgloweffect: boolean = false;
    @Input()
    get addgloweffect(): boolean { return this._addgloweffect; }
    set addgloweffect(value: boolean) {
        this._addgloweffect = value;
        this.setupChatWindowClass(this.windowposition);
    }

    private _brandlogo: string = 'data:image/png;base64,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'
    @Input()
    get brandlogo(): string { return this._brandlogo; }
    set brandlogo(value: string) { this._brandlogo = value; }

    @Input() identifier: string = '';
    @Input() knowledgebaseid: string = '';
    @Input() instanceurl: string = '';

    private _title: string = 'CloudApper AI'
    @Input()
    get title(): string { return this._title; }
    set title(value: string) { this._title = value; this.initialParameter.title = value; }

    private _userName: string = 'user123'
    @Input()
    get username(): string { return this._userName; }
    set username(value: string) { this._userName = value; this.initialParameter.userName = value; }

    private _botName: string = 'AI Assistant';
    @Input()
    get botname(): string { return this._botName; }
    set botname(value: string) { this._botName = value; this.initialParameter.botName = value; }

    private _userTextColor: string = '#414042';
    @Input()
    get usertextcolor(): string { return this._userTextColor; }
    set usertextcolor(value: string) { this._userTextColor = value; this.updateUserColorProfile(); }

    private _botTextColor: string = '#414042';
    @Input()
    get bottextcolor(): string { return this._botTextColor; }
    set bottextcolor(value: string) { this._botTextColor = value; this.updateBotColorProfile(); }

    private _userLabelColor: string = '#939598';
    @Input()
    get userlabelcolor(): string { return this._userLabelColor; }
    set userlabelcolor(value: string) { this._userLabelColor = value; this.updateUserColorProfile(); }

    private _botLabelColor: string = '#00aaff';
    @Input()
    get botlabelcolor(): string { return this._botLabelColor }
    set botlabelcolor(value: string) { this._botLabelColor = value; this.updateBotColorProfile(); }

    private _userBackgroundColor: string = '#edefef';
    @Input()
    get userbackgroundcolor(): string { return this._userBackgroundColor; }
    set userbackgroundcolor(value: string) { this._userBackgroundColor = value; this.updateUserColorProfile(); }

    private _botBackgroundColor: string = '#FFFFFF';
    @Input()
    get botbackgroundcolor(): string { return this._botBackgroundColor; }
    set botbackgroundcolor(value: string) { this._botBackgroundColor = value; this.updateBotColorProfile(); }

    private _chatWindowColor: string = '#f2f2f2'
    @Input()
    get chatwindowcolor(): string { return this._chatWindowColor; }
    set chatwindowcolor(value: string) { this._chatWindowColor = value; this.initialParameter.windowColors.secondaryColor = value; }

    private _chatPrimaryColor: string = '#f2f2f2'
    @Input()
    get chatprimarycolor(): string { return this._chatPrimaryColor; }
    set chatprimarycolor(value: string) { this._chatPrimaryColor = value; this.initialParameter.windowColors.primaryColor = value; }

    private _chatOnPrimaryColor: string = '#f2f2f2'
    @Input()
    get chatonprimarycolor(): string { return this._chatOnPrimaryColor; }
    set chatonprimarycolor(value: string) { this._chatOnPrimaryColor = value; this.initialParameter.windowColors.onPrimaryColor = value; }

    private _cancelOnTouchOutside: boolean = false;
    @Input()
    get cancelontouchoutside(): boolean { return this._cancelOnTouchOutside; }
    set cancelontouchoutside(value: boolean) {
        this._cancelOnTouchOutside = value;
        this.initialParameter.cancelOnClickOutside = value;
    }

    private changeScrollState(allow: boolean) {
        if (!allow) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            window.onscroll = function () {
                window.scrollTo(scrollLeft, scrollTop);
            }
        } else {
            window.onscroll = function () { }
        }
    }

    protected initialParameter: ChatBoxInputs = new ChatBoxInputs(
        'CloudApper AI',
        'user0123',
        'AI Assistant',
        new ChatWindowColorProfile('#1960d1', '#ffffff', '#FFFFFF'),
        {},
        false
    );

    protected chatBoxClass = 'chat-box-container';
    protected chatBoxBubbleClass = 'chat-box-bubble';
    protected chatBubbleTextClass = 'chat-box-bubble-text';
    protected chatContainerBubbleClass = 'chat-container-bubble'
    private _windowPosition: EnumWindowPosition = EnumWindowPosition.BottomRight;
    @Input()
    get windowposition(): EnumWindowPosition { return this._windowPosition; }
    set windowposition(value: EnumWindowPosition) {
        this._windowPosition = value;
        this.setupChatWindowClass(value);
    }

    private setupChatWindowClass(value: EnumWindowPosition) {
        if (this.bubblestyle === EnumBubbleStyle.Callout) {
            this.chatBoxBubbleClass = 'chat-box-bubble-callout'
        } else {
            this.chatBoxBubbleClass = 'chat-box-bubble'
        }

        switch (value) {
            case EnumWindowPosition.BottomLeft:
                this.chatBoxClass = 'chat-box-container chat-box-container-left';
                this.chatBoxBubbleClass += ' ' + 'chat-box-bubble-left';
                this.chatBubbleTextClass = 'chat-box-bubble-text chat-box-bubble-text-left';
                this.chatContainerBubbleClass = 'chat-container-bubble chat-container-bubble-left'
                break;
            case EnumWindowPosition.BottomRight:
                this.chatBoxClass = 'chat-box-container chat-box-container-right';
                this.chatBoxBubbleClass += ' ' + 'chat-box-bubble-right';
                this.chatBubbleTextClass = 'chat-box-bubble-text chat-box-bubble-text-right';
                this.chatContainerBubbleClass = 'chat-container-bubble chat-container-bubble-right'
                break;
        }
        if (this.addgloweffect) {
            this.chatBoxBubbleClass += ' ' + 'chat-box-bubble-animation'
        }


    }

    private resetGlowEffect() {
        if (this.addgloweffect) {
            if (this.showChatWindow || (this.isBubbleDelayCompleted && this.bubbletext.trim().length > 0)) {
                this.addgloweffect = false;
                this.setupChatWindowClass(this.windowposition);
            }
        }

    }

    private updateUserColorProfile() {
        this.initialParameter.userColors[ChatConstants.UserId] = new ChatColorProfile(this.userlabelcolor, this.usertextcolor, this.userbackgroundcolor);;
    }

    private updateBotColorProfile() {
        this.initialParameter.userColors[ChatConstants.BotId] = new ChatColorProfile(this.botlabelcolor, this.bottextcolor, this.botbackgroundcolor);;
    }

    private subscription?: Subscription;
    private replyId?: string;
    private replyMessage?: string;

    protected onReceiveUserReply(message?: string) {
        if (!message) { return; }
        // console.log('User replied: ' + message);
        if (this.chatService) {
            const replyId: string = uuidv4();
            let ended: boolean = false;
            this.replyId = replyId;
            this.replyMessage = undefined;
            const observable = this.chatService.submitUserReplyToBOT(message, () => {
                ended = true;
                this.replyId = undefined;
                if (this.chatBox) {
                    this.chatBox.setReadyForUserReply(true);
                }

                this.subscription = undefined
            });
            this.subscription = observable.pipe(takeWhile(() => { return !ended; }), untilDestroyed(this)).subscribe({
                next: (result: RESULT<{
                    message: string;
                    action?: ChatUIActionData,
                    suggestions?: ChatSuggestion[]
                }>) => {
                    switch (result.isError) {
                        case true:
                            if (this.chatBox) {
                                this.chatBox.addWarningfromBot(replyId, result.error!.message)
                            }

                            break;
                        case false:
                            if (this.chatBox && result.result) {
                                this.replyMessage = result.result.message
                                if (result.result.action) {
                                    this.chatBox.addActionReplyFromBot(replyId, result.result.message, result.result.action);
                                } else {
                                    this.chatBox.addReplyFromBot(replyId, result.result.message, undefined, result.result.suggestions);
                                }
                            }
                            break;
                    }
                }
            })
        }
    }

    protected onSubmitFileMessage(file: File) {
        this.fileService.uploadfile(file).pipe(untilDestroyed(this)).subscribe({
            next: (url) => { if (this.chatBox) { this.chatBox.addFileResponseFromUser(url, file) } },
            error: (reason) => { if (this.chatBox) { this.chatBox.uploadFileFailed(reason); } }
        })
    }

    protected onCancelUserRequest() {
        if (this.chatBox && this.replyId) {
            this.replyMessage = this.replyMessage || '' // (this.replyMessage ? '<br>' : '') + '![](data:image/png;base64,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) **Request was canceled.**'
            this.chatBox.addReplyFromBot(this.replyId, this.replyMessage)
        }
        this.subscription?.unsubscribe()
        this.subscription = undefined;
    }

    @ViewChild('chatBox')
    private chatBox?: CaChatBoxComponent;

    protected tryToCloseWindow() {
        if (this.initialParameter.cancelOnClickOutside) {
            this.closeChatWindow();
        }
    }

    @Input() welcomemessages: string[] = [];

    @Input() suggestionmessages?: string[];

    protected showChatWindow: boolean = false;

    openChatWindow() {
        this.showChatWindow = true;
        this.resetGlowEffect();
        this.bubbletext = ''
        this.changeScrollState(this.windowWidth > 480 && !this.cancelontouchoutside)
        setTimeout(() => {
            if (this.chatBox) {
                if (!this.minimized) {
                    let message: string = ''
                    if (this.welcomemessages.length > 0) {
                        const nextIndex = Math.floor(Math.random() * (this.welcomemessages.length - 1));
                        message = this.welcomemessages[nextIndex];
                    } else {
                        message = 'Hello, how can I help you today?';
                    }

                    this.chatBox.addReplyFromBot(uuidv4(), message, this.suggestionmessages)
                    this.chatService?.clearChatHistory();
                }

            }
        }, 100);

    }

    private minimized: boolean = false;

    protected closeChatWindow(minimize: boolean = false) {
        if (this.chatBox) {
            if (!minimize) {
                // reset history when closed completely.
                this.chatBox.reset();
                this.minimized = false;
            } else {
                this.minimized = true;
            }
            this.showChatWindow = false;
            this.changeScrollState(true)
        }
    }

    protected Assets = Assets
}