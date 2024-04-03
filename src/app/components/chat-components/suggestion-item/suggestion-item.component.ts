import { Component, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: 'suggestion-item',
    templateUrl: './suggestion-item.component.html',
    styleUrls: ['./suggestion-item.component.css']
})
export class SuggestionItemComponent {
    @Input() message: string = ''

    private _queryText: string | undefined = undefined;
    @Input()
    get queryText(): string { return this._queryText ? this._queryText : this.message; }
    set queryText(value: string) { this._queryText = value; }

    @Output() onMessageSelected = new BehaviorSubject<{
        message: string,
        queryText: string
    } | undefined>(undefined);

    protected onSelection() {
        this.onMessageSelected.next({
            message: this.message,
            queryText: this.queryText
        });
    }
}