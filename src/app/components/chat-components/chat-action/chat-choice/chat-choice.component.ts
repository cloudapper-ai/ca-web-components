/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject, debounceTime, distinctUntilChanged } from "rxjs";
import { darkenColor, lightenColor } from "../../../../helpers/helper-functions.helper";
import { Assets } from "../../../../models/assets.model";


@UntilDestroy()
@Component({
    selector: 'chat-choice',
    templateUrl: './chat-choice.component.html',
    styleUrls: ['./chat-choice.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ChatChoiceComponent implements OnInit {
    protected Assets = Assets;
    ngOnInit(): void {
        this.selected$.pipe(untilDestroyed(this), debounceTime(25)).subscribe(value => {
            if (value) {
                if (this.isMultiChoice) {
                    if (this.selectedMap.get(value)) {
                        this.selectedMap.delete(value)
                    } else {
                        this.selectedMap.set(value, value);
                    }
                } else {
                    this.selectedMap = new Map();
                    this.selectedMap.set(value, value);
                    setTimeout(() => {
                        this.choiceSelected.next(value);
                    }, 10)
                }
            }
        });

        this.primaryColor$.pipe(untilDestroyed(this)).subscribe(color => {
            this.choiceColor = darkenColor(color, 25);
            this.choiceBackgroundColor = '#fff';

            this.choiceSelectedColor = darkenColor(color, 25);
            this.choiceSelectedBackgroundColor = lightenColor(color, 40);

            this.choiceHoverColor = darkenColor(color, 25);
            this.choiceHoverBackgroundColor = lightenColor(color, 60);
        })

        this.submitButton$.pipe(untilDestroyed(this), debounceTime(50), distinctUntilChanged()).subscribe(value => {
            if (value && value.length > 0) {
                this.choiceSelected.next(value);
            }
        })
    }

    @Input() choices: string[] = []

    private primaryColor$: BehaviorSubject<string> = new BehaviorSubject<string>('#255db8');
    @Input()
    get primaryColor(): string { return this.primaryColor$.getValue(); }
    set primaryColor(value: string) { this.primaryColor$.next(value); }

    @Input() isMultiChoice: boolean = false;

    @Output() choiceSelected: EventEmitter<string> = new EventEmitter();

    protected trackChoice(index: number, choice: string) {
        return `${index}-${choice}-${this.isSelected(choice)}`;
    }

    protected isSelected(choice: string) {
        if (this.selectedMap.get(choice)) { return true; }
        else { return false; }
    }

    protected selectedMap: Map<string, string> = new Map();
    protected selected$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

    protected choiceColor: string = '#255db8'
    protected choiceBackgroundColor: string = '#a6c8ff'
    protected choiceSelectedColor: string = '#a6c8ff'
    protected choiceSelectedBackgroundColor: string = '#255db8'
    protected choiceHoverColor: string = '#255db8'
    protected choiceHoverBackgroundColor: string = '#629eff'


    private submitButton$: BehaviorSubject<string> = new BehaviorSubject<string>('');

    protected onSubmitMultiChoice() {
        let result = ''
        this.selectedMap.forEach(value => {
            if (result.length > 0) { result += '; ' }
            result += value;
        })

        this.submitButton$.next(result)
    }
}