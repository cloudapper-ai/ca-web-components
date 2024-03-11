/* eslint-disable prettier/prettier */
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject, debounceTime, distinctUntilChanged } from "rxjs";
import { ActionViewRecordsAttributes } from "../../../../models/chat-message.model";

@UntilDestroy()
@Component({
    selector: 'chat-record',
    templateUrl: './chat-record.component.html',
    styleUrls: ['./chat-record.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ChatRecordComponent implements OnInit {
    @Input() records: ActionViewRecordsAttributes[] = []
    @Output() recordSelected: EventEmitter<ActionViewRecordsAttributes> = new EventEmitter();
    private recordClicked$: BehaviorSubject<ActionViewRecordsAttributes | undefined> = new BehaviorSubject<ActionViewRecordsAttributes | undefined>(undefined);
    ngOnInit(): void {
        this.recordClicked$.pipe(untilDestroyed(this), debounceTime(25), distinctUntilChanged()).subscribe(value => {
            if (value) { this.recordSelected.next(value); }
        })
    }

    protected onRecordClicked(record: ActionViewRecordsAttributes) {
        this.recordClicked$.next(record);
    }
}