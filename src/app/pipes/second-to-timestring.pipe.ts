import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'secondsToTime',
    standalone: true
})
export class SecondsToTimePipe implements PipeTransform {
    transform(value: number): string {
        const hours: number = Math.floor(value / 3600);
        const minutes: number = Math.floor((value % 3600) / 60);
        const seconds: number = Math.floor(value % 60);

        if (hours > 0) {

            return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
        } else {
            return `${this.pad(minutes)}:${this.pad(seconds)}`;
        }
    }

    private pad(value: number): string {
        return value.toString().padStart(2, '0');
    }
}
