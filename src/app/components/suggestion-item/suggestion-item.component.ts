import { Component, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ChatColorProfile } from "src/app/models/chat-ui.model";

@Component({
    selector: 'suggestion-item',
    templateUrl: './suggestion-item.component.html',
    styleUrls: [ './suggestion-item.component.css' ]
})
export class SuggestionItemComponent implements OnInit {
    ngOnInit(): void {
        this.styles = this.getNotHoverStyle();
    } 

    @Input() colorProfile: ChatColorProfile = new ChatColorProfile('#fdfdfd', '#000000', '#0000FF');
    @Input() message: string = ''
    @Output() onMessageSelected = new BehaviorSubject<string|undefined>(undefined);

    private _isHovered: boolean = false;
    protected get isHovered(): boolean { 
        return this._isHovered
    }
    protected set isHovered(value: boolean) { 
        this._isHovered = value;
        if(value) { 
            this.styles = this.getHoverStyle();
        } else { 
            this.styles = this.getNotHoverStyle()
        }
    }

    protected onSelection() {
        this.onMessageSelected.next(this.message);
    }

    getHoverStyle() {
        return {
          'color': this.colorProfile.textColor,
          'border-color': this.colorProfile.textColor,
          'background-color': 'transperant',
          'font-weight': '500',
          'font-size': 'normal'
        };
      }
    
      getNotHoverStyle() {
        return {
          'color': this.colorProfile.labelColor,
          'border-color': this.colorProfile.labelColor,
          'background-color': 'transperant',
          'font-weight': '400',
          'font-size': 'normal'
        };
      }

    protected styles= {

    }
}