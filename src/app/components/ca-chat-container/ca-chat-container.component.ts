import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import { ChatConstants } from "src/app/models/chat-constants.model";
import { ChatBoxInputs, ChatColorProfile, ChatWindowColorProfile, EnumWindowPosition } from "src/app/models/chat-ui.model";
import { CaChatBoxComponent } from "../ca-chat-box/ca-chat-box.component";
import { uuidv4 } from "src/app/service-layer/utils";
import { takeWhile } from "rxjs";
import { trigger, transition, style, animate } from "@angular/animations";
import { IChatService } from "src/app/data-layer/interfaces/chat-service.interface";
import { ChatService } from "src/app/service-layer/chat-service.service";
import { DummyChatDataService } from "src/app/data-layer/dummy-chat-service.data-service";
import { ChatDataService } from "src/app/data-layer/chat-service.data-service";
import { RESULT } from "src/app/models/result.model";

@Component({ 
    selector: 'chat-container',
    templateUrl: './ca-chat-container.component.html',
    styleUrls: [ 
        './ca-chat-container.component.css',
        './ca-chat-box-container.component.css',
        './ca-chat-box-bubble-container.component.css',
    ]
})
export class ChatContainerComponent implements OnChanges {
    private chatDataService?: IChatService;
    private chatService?: ChatService;
    constructor() { 
        this.chatDataService = new DummyChatDataService();
        this.chatService = new ChatService(this.chatDataService!)
        
        this.setupChatWindowClass(this.windowposition);
        this.updateUserColorProfile()
        this.updateBotColorProfile()
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['identifier'] || changes['knowledgebaseId'] || changes['aiURL']) {
            if(this.identifier && this.identifier.trim().length > 0 
            && this.knowledgebaseid && this.knowledgebaseid.trim() 
            && this.instanceurl && this.instanceurl.trim()) {
                this.chatDataService = new ChatDataService(this.instanceurl.trim(), this.identifier.trim(), this.knowledgebaseid.trim());
            } else { 
                this.chatDataService = new DummyChatDataService();
            }

            this.chatService = new ChatService(this.chatDataService!);
        }
        const container = document.getElementsByName('container');
        if(container && container.length > 0) { 
            for(let i = 0; i<container.length-1; i++) { 
                container[i].innerHTML = ''
            }
        } 
    }

    @Input() bubbletext: string = ''
    @Input() bubblebackgroundcolor = '#edefef';
    @Input() bubbleforegroundcolor = '#414042';


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
    set cancelontouchoutside(value: boolean) { this._cancelOnTouchOutside = value; this.initialParameter.cancelOnClickOutside = value; }

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
        switch (value) {
            case EnumWindowPosition.BottomLeft:
                this.chatBoxClass = 'chat-box-container chat-box-container-left';
                this.chatBoxBubbleClass = 'chat-box-bubble chat-box-bubble-left';
                this.chatBubbleTextClass = 'chat-box-bubble-text chat-box-bubble-text-left';
                this.chatContainerBubbleClass = 'chat-container-bubble chat-container-bubble-left'
                break;
            case EnumWindowPosition.BottomRight:
                this.chatBoxClass = 'chat-box-container chat-box-container-right';
                this.chatBoxBubbleClass = 'chat-box-bubble chat-box-bubble-right';
                this.chatBubbleTextClass = 'chat-box-bubble-text chat-box-bubble-text-right';
                this.chatContainerBubbleClass = 'chat-container-bubble chat-container-bubble-right'
                break;
        }
    }

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

    @ViewChild('chatBox')
    private chatBox?: CaChatBoxComponent;

    protected tryToCloseWindow() {
        if(this.initialParameter.cancelOnClickOutside) {
            this.closeChatWindow();
        }
    }

    @Input() welcomemessages: string[] = [];

    @Input() suggestionmessages?: string[];

    protected showChatWindow: boolean = false;

    openChatWindow() {
        this.showChatWindow = true;
        setTimeout(()=> {
            if(this.chatBox){
                let message: string = ''
                if(this.welcomemessages.length > 0) {
                    const nextIndex = Math.floor(Math.random() * (this.welcomemessages.length - 1));
                    message = this.welcomemessages[nextIndex];
                } else {
                    message = 'Hello, how can I help you today?';
                }
    
                this.chatBox.addReplyFromBot(uuidv4(), message, this.suggestionmessages)
                this.chatService?.clearChatHistory();
            }
        }, 100);
        
        
    }

    protected closeChatWindow() {
        if(this.chatBox) {
            this.chatBox.reset();
            const container = document.getElementsByName('container');
            if(container && container.length > 0) { 
                for(let i = 0; i<container.length -1; i++) { 
                    container[i].innerHTML = ''
                }
            } 
            this.showChatWindow = false;
        }
    }
}