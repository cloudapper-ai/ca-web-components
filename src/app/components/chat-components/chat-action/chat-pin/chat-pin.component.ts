import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Assets } from "../../../../models/assets.model";
import { ActionReadPinAttributes } from "../../../../models/chat-message.model";

@Component({
    selector: 'chat-pin',
    templateUrl: './chat-pin.component.html',
    styleUrls: ['./chat-pin.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ChatPinComponent {
    @Input() setting: ActionReadPinAttributes = <ActionReadPinAttributes>{
        Title: 'Enter your pin',
        PinLength: 4,
        IsAlphaNumericPin: false
    };
    @Output() requestPin = new EventEmitter<ActionReadPinAttributes>();

    protected Assets = Assets;
}