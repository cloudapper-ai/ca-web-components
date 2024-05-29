/* eslint-disable @typescript-eslint/no-inferrable-types */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: 'time-span',
    template: `<span [style.color]="color" style="font-size: 14px; font-weight: 400;">{{timeString}}</span>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeSpanComponent implements OnInit, OnDestroy {
    constructor(private cdr: ChangeDetectorRef) { }
    protected timeString: string = ''
    @Input() color: string = 'white';

    private timeElapsed$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    @Input()
    get timeElapsed(): number { return this.timeElapsed$.getValue(); }
    set timeElapsed(value: number) { this.timeElapsed$.next(value); }

    private format(num: number, padding: number): string {
        return num.toString().padStart(padding, '0');
    }

    ngOnInit(): void {
        this.timeElapsed$.subscribe((elapsed) => {
            let timeLeft = elapsed;
            let hours = 0;
            let minutes = 0;
            let seconds = 0;
            if (timeLeft >= 3600) {
                hours = timeLeft % 3600;
                timeLeft = timeLeft - hours * 3600;
            }

            if (timeLeft >= 60) {
                minutes = timeLeft % 60;
                timeLeft = timeLeft - (minutes * 60);
            }

            seconds = timeLeft;

            this.timeString = this.format(hours, 2) + ':' + this.format(minutes, 2) + ':' + this.format(seconds, 2);
            this.cdr.markForCheck();
        })
    }

    ngOnDestroy(): void {
        this.timeElapsed$.unsubscribe();
    }
}