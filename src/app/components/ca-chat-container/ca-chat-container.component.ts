import { AfterContentInit, AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { CaChatBoxComponent } from "../ca-chat-box/ca-chat-box.component";
import { takeWhile } from "rxjs";
import { ChatDataService } from "src/app/data-layer/chat-service.data-service";
import { DummyChatDataService } from "src/app/data-layer/dummy-chat-service.data-service";
import { IChatService } from "src/app/data-layer/interfaces/chat-service.interface";
import { ChatConstants } from "src/app/models/chat-constants.model";
import { ChatBoxInputs, ChatWindowColorProfile, ChatColorProfile } from "src/app/models/chat-ui.model";
import { RESULT } from "src/app/models/result.model";
import { ChatService } from "src/app/service-layer/chat-service.service";
import { uuidv4 } from "src/app/service-layer/utils";

@Component({
    selector: 'ca-chat-container',
    templateUrl: './ca-chat-container.component.html',
    styleUrls: [ './ca-chat-container.component.css' ]
})
export class CAChatContainer implements AfterViewInit {
    private chatDataService?: IChatService;
    private chatService?: ChatService;
    constructor() { 
        this.chatDataService = new DummyChatDataService();
        this.chatService = new ChatService(this.chatDataService!)
        this.updateUserColorProfile()
        this.updateBotColorProfile()
    }
    ngAfterViewInit(): void {
        this.initiateChatMessages();
    }

    private setupChatDataService() {
        if(this.knowledgebaseid.trim().length > 0 
        && this.instanceurl.trim().length > 0
        && this.identifier.trim().length > 0) {
            this.chatDataService = new ChatDataService(this.instanceurl, this.identifier, this.knowledgebaseid);
        } else { 
            this.chatDataService = new DummyChatDataService();
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
    set instanceurl(value: string) { this.instanceurl = value; this.setupChatDataService(); }

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

    protected initialParameter: ChatBoxInputs = new ChatBoxInputs(
        'CloudApper AI', 
        'user0123', 
        'AI Assistant', 
        new ChatWindowColorProfile('#FFFFFF', '#00aaff', '#FFFFFF'), 
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
        if(!message) { return; }
        // console.log('User replied: ' + message);
        if(this.chatService) {
            const replyId: string = uuidv4();
            let ended: boolean = false;
            const observable = this.chatService.submitUserReplyToBOT(message, ()=> {
                ended = true;
                if(this.chatBox) { 
                    this.chatBox.setReadyForUserReply(true);
                }
            });
            observable.pipe(takeWhile(()=> { return !ended; })).subscribe({
                next: (result: RESULT<string>)=> { 
                    switch(result.isError) {
                        case true: 
                            if(this.chatBox) { 
                                this.chatBox.addWarningfromBot(replyId, result.error!.message)
                            }
                            
                            break;
                        case false: 
                            if(this.chatBox) { 
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
    get suggestionmessages(): string[]|undefined { 
        return this._suggestionmessages;
    }
    set suggestionmessages(value: string[] | undefined) {
        this._suggestionmessages = value
        this.initiateChatMessages();
    }

    private initiateChatMessages() { 
        this.chatBox?.reset();
        const index = Math.round(Math.random() * (this.welcomemessages.length - 1));
        this.chatBox?.addReplyFromBot(uuidv4(), this.welcomemessages[index], this.suggestionmessages)
    }
}