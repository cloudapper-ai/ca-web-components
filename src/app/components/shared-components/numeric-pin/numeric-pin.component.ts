/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'numeric-pin',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './numeric-pin.component.html',
    styleUrls: ['./numeric-pin.component.css'],
})
export class NumericPinComponent implements AfterViewInit {
    ngAfterViewInit(): void {
        this.checkOrientation();
    }

    @ViewChild('numpad') protected numpad?: ElementRef<HTMLDivElement>;

    @Input() length: number = 0
    @Input() title: string = 'Enter your pin'
    @Input() subtitle: string | undefined = undefined;
    @Output() pinReady: EventEmitter<string> = new EventEmitter();
    @Output() dismiss = new EventEmitter<void>();

    protected isLandscape$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private checkOrientation() {
        setTimeout(() => {
            if (this.numpad) {
                const islandscape = this.numpad.nativeElement.clientHeight < 420;
                console.log('isLandscape: ', islandscape, this.numpad.nativeElement.clientWidth, this.numpad.nativeElement.clientHeight)
                this.isLandscape$.next(islandscape);
            }
        }, 50);

    }

    @HostListener('window:orientationchange', ['$event'])
    protected onOrientationChange(event: Event) {
        this.checkOrientation();
    }

    @HostListener('document:keyup', ['$event'])
    protected onKeyUp(event: KeyboardEvent) {
        if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(event.key)) {
            this.verifyInput(event.key)
        }
    }


    protected currentPin: string = ""

    protected verifyInput(value: string) {
        let maxlength = 10;
        if (this.length > 0 && this.length < 10) { maxlength = this.length; }

        const temp = this.currentPin + value;
        const newLength = temp.length;
        if (newLength <= maxlength) {

            this.currentPin = temp;
            if (this.length === 0) { this.showSubmitButton = true; return }
            else if (newLength === this.length) {
                this.pinReady.next(this.currentPin);
            }

            this.showSubmitButton = false;
        }
    }

    protected clearInput() {
        this.showSubmitButton = false;
        this.currentPin = '';
    }

    protected onClose() { this.dismiss.next(); }
    protected onSubmit() { this.pinReady.next(this.currentPin); }

    protected showSubmitButton = false;

    protected readonly BackspaceIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAACxAAAAsQHGLUmNAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAPhJREFUSInt1LFKA0EUBdATJVa2glpYi3+gjQj+hrWV32D+wCK1oIWVkLQKfopomWBhMGVEN8VOwIzOZmMcbHJhYOftfffOvDc8lvhvNGb838L2nJoDPM0ireISxS/XPdaqDC4WEJ+sk5T46R+IFziHlUj8GO2E8Sf6UewdLwl+IzbYxS2aiYQb7KAb9kMc4ijBn8I6HlVfeYiDcIBr7IfvboLf+mpQt+4TE0G8U8Ft8b0H2ZC9RJRNHlQYXJkuy1sw2atrQPlMR4mED/Si2Ej5TGv34AFnPzkH7mYUa2IjwS8ScWQeFSw+7O6EYZdjXL/iec6cJTJiDAcltYzv8i8ZAAAAAElFTkSuQmCC';
    protected readonly CloseButton = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAhQAAAIUB4uz/wQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFNSURBVEiJzZGxSkJhGIaf79Ml7+FAWRHUGETS0KBX0aB0AwotOdbWVNjoUgaCN+HQUEHQmCAdRBTOLbic838NhhIGisdDvtPPz/8/D7yvAFgQZCCsAmfAJpBiuURAH7MmTm/E80ZiQZDBwjbC8ZLQvyP2Rqh5hbC6cjiASQ51l2LBwAe2Vy4AEHxl3HkyMbaU5QddJClNEA7A/wtcq475nZl78zu4Vj2+QI5OcY0a9vU5hfe6uEYNOTyZKxALBjbvkfW6uIdbtFiGVHpylt2D1Qjgp5JGDQAtVZCd/UW+rcHIMO1ci2X0/GJmk1gC63Vxj3eTziW7N5Y83S8kmS94f0aLlV+DSnYPLVWwj5e5goVHXjbrMXJcQZQgP1Kgn6Cgp5g1E8OLNMWGww3Sro1JbsX0VyIKKp43ItQ8ZtcIPvE2iRB8RK6IKIjnjb4BKVqHRs2egwcAAAAASUVORK5CYII=';
}
