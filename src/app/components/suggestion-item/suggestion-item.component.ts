import { Component, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ChatColorProfile } from "src/app/models/chat-ui.model";

@Component({
    selector: 'suggestion-item',
    templateUrl: './suggestion-item.component.html',
    styleUrls: [ './suggestion-item.component.css' ]
})
export class SuggestionItemComponent {
    
    private _colorProfile: ChatColorProfile = new ChatColorProfile('#fdfdfd', '#000000', '#0000FF');
    @Input() 
    get colorProfile(): ChatColorProfile { return this._colorProfile; }
    set colorProfile(value: ChatColorProfile) { 
        this._colorProfile = value;
        document.documentElement.style.setProperty('--border-color', this.colorProfile.labelColor);
        document.documentElement.style.setProperty('--border-color-hover', this.colorProfile.textColor);
        document.documentElement.style.setProperty('--foreground-color', this.colorProfile.labelColor);
        document.documentElement.style.setProperty('--foreground-color-hover', this.colorProfile.textColor);
    }
    @Input() message: string = ''
    @Output() onMessageSelected = new BehaviorSubject<string|undefined>(undefined);

    protected onSelection() {
        this.onMessageSelected.next(this.message);
    }
}