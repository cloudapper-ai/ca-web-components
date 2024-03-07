/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject } from "rxjs";
import { ActionScheduleAttributes } from "../../../../models/chat-message.model";
import { RESULT } from "../../../../models/result.model";

@UntilDestroy()
@Component({
    selector: 'chat-schedular-view',
    templateUrl: './chat-schedular.component.html',
    styleUrls: ['./chat-schedular.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ChatSchedularComponent {
    @Input() primaryColor: string = '#dda'
    @Input() attribute: ActionScheduleAttributes = <ActionScheduleAttributes>{}
    @Output() requestOpenAppointment = new EventEmitter<{
        attribute: ActionScheduleAttributes,
        subject: BehaviorSubject<RESULT<boolean>>
    }>()

    protected error?: string = undefined;
    private subject = new BehaviorSubject<RESULT<boolean>>(RESULT.ok(true));
    protected onRequestOpenAppointment() {
        this.subject.unsubscribe();
        this.subject = new BehaviorSubject<RESULT<boolean>>(RESULT.ok(false));
        this.subject.pipe(untilDestroyed(this)).subscribe(result => {
            if (result.isError && result.error) {
                this.error = result.error.message;
                setTimeout(() => {
                    this.error = undefined;
                }, 3000);

                this.subject.unsubscribe();
            } else if (result.result) {
                if (this.attribute.OnCompleteMessageFormat && this.attribute.OnCompleteMessageFormat.length) {
                    this.submitReply.next(this.attribute.OnCompleteMessageFormat);
                } else {
                    this.submitReply.next('I have made an appointment. Please confirm.')
                }

                this.subject.unsubscribe();
            }
        })

        this.requestOpenAppointment.next({ attribute: this.attribute, subject: this.subject })
    }

    @Output() submitReply: EventEmitter<string> = new EventEmitter();

    protected isProcessing = false;
}