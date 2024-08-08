import { AfterViewInit, Component, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { CaChatBoxComponent } from "../chat-components/ca-chat-box/ca-chat-box.component";
import { BehaviorSubject, Observable, Subscription, combineLatest, debounceTime, distinctUntilChanged, map, takeWhile } from "rxjs";
import { ChatDataService } from "../../data-layer/chat-service.data-service";
import { DummyChatDataService } from "../../data-layer/dummy-chat-service.data-service";
import { ChatConstants } from "../../models/chat-constants.model";
import { ChatBoxInputs, ChatWindowColorProfile, ChatColorProfile } from "../../models/chat-ui.model";
import { RESULT } from "../../models/result.model";
import { ChatService } from "../../service-layer/chat-service.service";
import { uuidv4 } from "../../helpers/utils";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ChatSuggestion, ChatUIActionData } from "../../models/chat-message.model";
import { FileService } from "../../service-layer/file-service.service";
import { EnumFileUploadStatus, FileInformation } from "../../models/file-data.model";

@UntilDestroy()
@Component({
    selector: 'ca-chat-container',
    templateUrl: './ca-chat-container.component.html',
    styleUrls: ['./ca-chat-container.component.css'],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class CAChatContainer implements OnInit, AfterViewInit {
    private chatService?: ChatService;
    constructor(private fileService: FileService) {
        this.chatService = new ChatService(new DummyChatDataService())

        this.updateUserColorProfile()
        this.updateBotColorProfile()
    }
    ngOnInit(): void {
        this.initateRequest.pipe(untilDestroyed(this), debounceTime(100), distinctUntilChanged()).subscribe(() => {
            this.chatBox?.reset();
            if (this.initmsg && this.initmsg.length) {
                this.chatBox?.submitMessageWithoutShowing(this.initmsg)
            } else if (this.welcomemessages.length) {
                const index = Math.round(Math.random() * (this.welcomemessages.length - 1));
                this.chatBox?.addReplyFromBot(uuidv4(), this.welcomemessages[index], this.suggestionmessages);
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
            this.fileService.updateEndpoint(this.instanceurl, this.identifier)
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

    private _subtitle: string = 'CloudApper AI'
    @Input()
    get subtitle(): string { return this._subtitle; }
    set subtitle(value: string) { this._subtitle = value; this.initialParameter.subtitle = value; }

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

    private _botLabelColor: string = '#0393db';
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
        'Powered by CloudApper AI',
        'user0123',
        'AI Assistant',
        new ChatWindowColorProfile('#0393db', '#ffffff', '#FFFFFF'),
        {},
        false
    );

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

                this.subscription = undefined;
            });
            this.subscription = observable.pipe(takeWhile(() => { return !ended; })).subscribe({
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

    protected onSubmitFileMessage(files: FileInformation[]) {
        const fileArray = [...files];
        const observables: Observable<FileInformation>[] = []
        fileArray.forEach(x => { if (x.uploadStatus !== EnumFileUploadStatus.Uploaded) observables.push(this.fileService.uploadfile(x)) });
        combineLatest(observables.map((obs) => obs.pipe(
            map((value: FileInformation) => ({ value, timestamp: Date.now() }))
        ))
        ).pipe(untilDestroyed(this)).subscribe({
            next: (data) => {
                const newResponse = data.reduce((latest, current) => {
                    if (!latest || current.timestamp > latest.timestamp) {
                        return current;
                    }

                    return latest;
                })
                const index = fileArray.findIndex(x => x.id === newResponse.value.id);
                if (index !== -1) {
                    fileArray.splice(index, 1, newResponse.value)
                }
                if (this.chatBox) { this.chatBox.updateFileInformation(newResponse.value) }
            },
            complete: () => {
                const hasError = fileArray.find(x => x.uploadError) !== undefined;
                if (!hasError) {
                    if (this.chatBox) { this.chatBox.addFileResponseFromUser(fileArray) }
                }
            }
        })
    }

    protected onCancelUserRequest() {
        if (this.chatBox && this.replyId) {
            // this.replyMessage = (this.replyMessage ? this.replyMessage : '') + (this.replyMessage ? '<br>' : '') + '![](data:image/png;base64,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) **Request was canceled.**'
            this.replyMessage = this.replyMessage || '' // (this.replyMessage ? '<br>' : '') + '![](data:image/png;base64,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) **Request was canceled.**'
            this.chatBox.addReplyFromBot(this.replyId, this.replyMessage)
        }
        this.subscription?.unsubscribe()
        this.subscription = undefined;
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