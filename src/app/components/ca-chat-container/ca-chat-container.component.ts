import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
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
    styleUrls: [ './ca-chat-container.component.css' ],
    animations: [
        trigger('chatBox', [
            transition(':enter', [
                style({ 
                    opacity: 0,
                    transform: 'scale(0) translate(100%, 100%)'
                }),
                animate(300, style({
                    opacity: 1,
                    transform: 'scale(1) translate(0, 0)'
                }))
            ]),
            transition(':leave', [
                style({opacity: 1}),
                animate(100, style({opacity: 0}))
            ])
        ])
    ]
})
export class ChatContainerComponent implements OnInit, OnChanges {
    private chatDataService?: IChatService;
    private chatService?: ChatService;
    ngOnInit(): void {
        if(!this.chatService) {
            this.chatDataService = new DummyChatDataService();
            this.chatService = new ChatService(this.chatDataService!)
        }
        
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
        
    }

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
                this.chatContainerBubbleClass = 'chat-container-bubble chat-container-bubble-left'
                break;
            case EnumWindowPosition.BottomRight:
                this.chatBoxClass = 'chat-box-container chat-box-container-right';
                this.chatBoxBubbleClass = 'chat-box-bubble chat-box-bubble-right';
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
            this.showChatWindow = false;
        }
    }
}