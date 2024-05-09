import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'alpha-numeric-pin',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './alpha-numeric-pin.component.html',
    styleUrls: ['./alpha-numeric-pin.component.css'],
})
export class AlphaNumericPinComponent implements AfterViewInit {
    ngAfterViewInit(): void {
        this.passcodeInput?.nativeElement.focus();
    }
    @Input() title: string = 'Enter your pin'
    @Input() subtitle: string | undefined = undefined;
    @Input() length: number = 4;

    @Output() dismiss = new EventEmitter<void>();
    @Output() pinReady = new EventEmitter<string>();

    onDismiss() { this.dismiss.next(); }

    @ViewChild('passcode') protected passcodeInput?: ElementRef<HTMLInputElement>;

    protected currentPin: string = '';
    protected showSubmitButton: boolean = false;

    protected verifyInput(value: string): boolean {
        let maxlength = 10;
        if (this.length > 0 && this.length < 10) { maxlength = this.length; }

        const oldValue = this.currentPin;
        const newValue = value.substring(0, Math.min(maxlength, value.length));

        const newLength = newValue.length;
        if (newLength <= maxlength) {
            this.currentPin = newValue;
            if (this.length === 0) { this.showSubmitButton = true; return true; }
            else if (newLength === this.length) {
                this.pinReady.next(this.currentPin);
            }

            this.showSubmitButton = false;

            return true;
        } else {
            this.currentPin = oldValue;
        }

        return false;
    }

    protected onSubmit() {
        this.pinReady.next(this.currentPin);
    }

    protected readonly CloseButton = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAhQAAAIUB4uz/wQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFNSURBVEiJzZGxSkJhGIaf79Ml7+FAWRHUGETS0KBX0aB0AwotOdbWVNjoUgaCN+HQUEHQmCAdRBTOLbic838NhhIGisdDvtPPz/8/D7yvAFgQZCCsAmfAJpBiuURAH7MmTm/E80ZiQZDBwjbC8ZLQvyP2Rqh5hbC6cjiASQ51l2LBwAe2Vy4AEHxl3HkyMbaU5QddJClNEA7A/wtcq475nZl78zu4Vj2+QI5OcY0a9vU5hfe6uEYNOTyZKxALBjbvkfW6uIdbtFiGVHpylt2D1Qjgp5JGDQAtVZCd/UW+rcHIMO1ci2X0/GJmk1gC63Vxj3eTziW7N5Y83S8kmS94f0aLlV+DSnYPLVWwj5e5goVHXjbrMXJcQZQgP1Kgn6Cgp5g1E8OLNMWGww3Sro1JbsX0VyIKKp43ItQ8ZtcIPvE2iRB8RK6IKIjnjb4BKVqHRs2egwcAAAAASUVORK5CYII=';

}
