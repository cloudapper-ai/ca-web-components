import { AfterViewInit, Component, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { CaChatBoxComponent } from "../ca-chat-box/ca-chat-box.component";
import { BehaviorSubject, debounceTime, distinctUntilChanged, takeWhile } from "rxjs";
import { ChatDataService } from "src/app/data-layer/chat-service.data-service";
import { DummyChatDataService } from "src/app/data-layer/dummy-chat-service.data-service";
import { ChatConstants } from "src/app/models/chat-constants.model";
import { ChatBoxInputs, ChatWindowColorProfile, ChatColorProfile } from "src/app/models/chat-ui.model";
import { RESULT } from "src/app/models/result.model";
import { ChatService } from "src/app/service-layer/chat-service.service";
import { uuidv4 } from "src/app/service-layer/utils";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
    selector: 'ca-chat-container',
    templateUrl: './ca-chat-container.component.html',
    styleUrls: ['./ca-chat-container.component.css'],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class CAChatContainer implements OnInit, AfterViewInit {
    private chatService?: ChatService;
    constructor() {
        this.chatService = new ChatService(new DummyChatDataService())
        this.updateUserColorProfile()
        this.updateBotColorProfile()
    }
    ngOnInit(): void {
        this.initateRequest.pipe(untilDestroyed(this), debounceTime(100), distinctUntilChanged()).subscribe(() => {
            this.chatBox?.reset();
            if (this.initmsg && this.initmsg.length) {
                this.chatBox?.applyInitialMessage(this.initmsg)
            } else if (this.welcomemessages.length) {
                const index = Math.round(Math.random() * (this.welcomemessages.length - 1));
                this.chatBox?.addReplyFromBot(uuidv4(), this.welcomemessages[index], this.suggestionmessages)
            }

        })
    }
    ngAfterViewInit(): void {
        this.initiateChatMessages();
    }

    private setupChatDataService() {
        if (this.instanceurl.trim().length > 0
            && this.identifier.trim().length > 0) {
            this.chatService = new ChatService(new ChatDataService(this.instanceurl, this.identifier, this.knowledgebaseid));
        } else {
            this.chatService = new ChatService(new DummyChatDataService());
        }
    }

    private _identifier: string = ''
    @Input()
    get identifier(): string {
        return this._identifier;
    }

    set identifier(value: string) { this._identifier = value; this.setupChatDataService(); }

    private _knowledgebaseid: string = '';
    @Input()
    get knowledgebaseid(): string { return this._knowledgebaseid; }
    set knowledgebaseid(value: string) { this._knowledgebaseid = value; this.setupChatDataService(); }
    private _instanceurl: string = '';
    @Input()
    get instanceurl(): string { return this._instanceurl; }
    set instanceurl(value: string) { this._instanceurl = value; this.setupChatDataService(); }

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


    private _initMsg?: string;
    @Input()
    get initmsg(): string | undefined { return this._initMsg; }
    set initmsg(value: string | undefined) { this._initMsg = value; this.initiateChatMessages(); }

    protected initialParameter: ChatBoxInputs = new ChatBoxInputs(
        'CloudApper AI',
        'user0123',
        'AI Assistant',
        new ChatWindowColorProfile('#00aaff', '#ffffff', '#FFFFFF'),
        {},
        false
    );

    private updateUserColorProfile() {
        this.initialParameter.userColors[ChatConstants.UserId] = new ChatColorProfile(this.userlabelcolor, this.usertextcolor, this.userbackgroundcolor);;
    }

    private updateBotColorProfile() {
        this.initialParameter.userColors[ChatConstants.BotId] = new ChatColorProfile(this.botlabelcolor, this.bottextcolor, this.botbackgroundcolor);;
    }

    protected onReceiveUserReply(message?: string) {
        if (!message) { return; }
        // console.log('User replied: ' + message);
        if (this.chatService) {
            const replyId: string = uuidv4();
            let ended: boolean = false;
            const observable = this.chatService.submitUserReplyToBOT(message, () => {
                ended = true;
                if (this.chatBox) {
                    this.chatBox.setReadyForUserReply(true);
                }
            });
            observable.pipe(takeWhile(() => { return !ended; })).subscribe({
                next: (result: RESULT<string>) => {
                    switch (result.isError) {
                        case true:
                            if (this.chatBox) {
                                this.chatBox.addWarningfromBot(replyId, result.error!.message)
                            }

                            break;
                        case false:
                            if (this.chatBox) {
                                this.chatBox.addReplyFromBot(replyId, result.result!)
                            }
                            break;
                    }
                }
            })
        }
    }

    @ViewChild('simplechatBox')
    protected chatBox?: CaChatBoxComponent;

    private _welcomemessages: string[] = [];
    @Input()
    get welcomemessages(): string[] {
        return this._welcomemessages;
    }
    set welcomemessages(value: string[]) {
        this._welcomemessages = value;
        this.initiateChatMessages();
    }

    private _suggestionmessages?: string[] = undefined;
    @Input()
    get suggestionmessages(): string[] | undefined {
        return this._suggestionmessages;
    }
    set suggestionmessages(value: string[] | undefined) {
        this._suggestionmessages = value
        this.initiateChatMessages();
    }

    private initateRequest: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

    private initiateChatMessages() {
        this.initateRequest.next(uuidv4());
    }
}