import { animate, style, transition, trigger } from "@angular/animations";
import { Component, Input, Output } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ChatConstants } from "src/app/models/chat-constants.model";
import { ChatMessage } from "src/app/models/chat-message.model";
import { ChatColorProfile } from "src/app/models/chat-ui.model";

@Component({
    selector: 'chat-item',
    templateUrl: './chat-item.component.html',
    styleUrls: [ './chat-item.component.css' ],
    animations: [
        trigger('item', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate(150, style({opacity: 1}))
            ]),
            transition(':leave', [
                style({opacity: 1}),
                animate(100, style({opacity: 0}))
            ])
        ])
    ]
})
export class ChatItemComponent { 
    protected userColorProfile: ChatColorProfile = new ChatColorProfile('#38383b', '#0e1221', '#c7c7c9')
    protected botColorProfile: ChatColorProfile = new ChatColorProfile('#1a1a9c', '#0e1221', '#FFFFFF')

    @Input() user: string = 'user0123'
    @Input() bot: string = 'AI Assistant'
    @Input() 
    set colorProfiles(value: Record<string, ChatColorProfile>) {
        if(value[ChatConstants.UserId]) {
            this.userColorProfile = value[ChatConstants.UserId];
        }

        if(value[ChatConstants.BotId]) {
            this.botColorProfile = value[ChatConstants.BotId];
        }
    }

    protected isBotReply: boolean = false;
    private _message: ChatMessage = new ChatMessage('', '', '');
    @Input() 
    set message(value: ChatMessage) {
        this._message = value;
        this.isBotReply = value.userId === ChatConstants.BotId;
    }

    get message(): ChatMessage {
        return this._message;
    }

    @Output() suggestionSelected: BehaviorSubject<string|undefined> = new BehaviorSubject<string|undefined>(undefined);

    protected onSuggestionSelected(message: string| undefined) {
        if(message) { 
            this.suggestionSelected.next(message);
        }
    }
}