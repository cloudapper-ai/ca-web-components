/* eslint-disable prettier/prettier */
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject, Observable, debounceTime, delay, distinctUntilChanged } from "rxjs";
import { ActionListAttributes, ActionRecordViewAttributes, DynamicObject } from "../../../../models/chat-message.model";

@UntilDestroy()
@Component({
    selector: 'chat-record',
    templateUrl: './chat-record.component.html',
    styleUrls: ['./chat-record.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ChatRecordComponent implements OnInit {
    @Input() primaryColor: string = '#154881';
    private records$ = new BehaviorSubject<DynamicObject[]>([]);
    @Input()
    get records(): DynamicObject[] { return this.records$.getValue(); }
    set records(value: DynamicObject[]) { this.records$.next(value); }

    @Output() recordSelected: EventEmitter<ActionRecordViewAttributes> = new EventEmitter();

    private recordClicked$: BehaviorSubject<ActionRecordViewAttributes | undefined> = new BehaviorSubject<ActionRecordViewAttributes | undefined>(undefined);


    protected recordlist: ActionRecordViewAttributes[] = [];

    ngOnInit(): void {
        this.records$.pipe(untilDestroyed(this)).subscribe(list => {
            this.recordlist = [];
            let index: number = 0;
            list.forEach(x => {
                setTimeout(() => { const obj = ActionRecordViewAttributes.get(x); if (obj) this.recordlist.push(obj); }, index * 50);
                index += 1;
            })
        })
        this.recordClicked$.pipe(untilDestroyed(this), debounceTime(25), distinctUntilChanged()).subscribe(value => {
            if (value) { this.recordSelected.next(value); }
        })
    }

    protected onRecordClicked(record: ActionRecordViewAttributes) {
        this.recordClicked$.next(record);
    }

    protected trackRecord(index: number, record: ActionRecordViewAttributes) {
        return record.Id;
    }
}