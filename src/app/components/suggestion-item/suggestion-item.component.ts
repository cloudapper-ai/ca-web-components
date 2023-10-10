import { Component, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ChatColorProfile } from "src/app/models/chat-ui.model";

@Component({
    selector: 'suggestion-item',
    templateUrl: './suggestion-item.component.html',
    styleUrls: [ './suggestion-item.component.css' ]
})
export class SuggestionItemComponent {
    @Input() message: string = ''
    @Output() onMessageSelected = new BehaviorSubject<string|undefined>(undefined);

    protected onSelection() {
        this.onMessageSelected.next(this.message);
    }
}