import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Assets } from "../../../../models/assets.model";

@Component({
    selector: 'chat-location',
    templateUrl: './chat-location.component.html',
    styleUrls: ['./chat-location.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ChatLocationComponent {
    protected Assets = Assets;
    protected error$ = new BehaviorSubject<string | undefined>(undefined);
    private get error(): string | undefined { return this.error$.getValue(); }
    private set error(value: string | undefined) {
        this.error$.next(value);
        if (value) {
            setTimeout(() => {
                this.error$.next(undefined);
            }, 3000);
        }
    }

    protected isFetching: boolean = false;
    protected getlocationClicked() {
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                if (result.state === 'granted' || result.state === 'prompt') {
                    this.isFetching = true;
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const latitude = position.coords.latitude;
                            const longitude = position.coords.longitude;
                            this.geoLocationReceived.next({ lat: latitude, lng: longitude });
                        },
                        (error) => {
                            this.error = `Error getting location: ${error.message}`;
                        });

                    return;
                } else if (result.state === 'denied') {
                    this.error = 'Geolocation permission has been denied.You can enable it in your browser settings.';
                }

                this.isFetching = false;
            })
        } else {
            this.error = 'Geolocation API is not supported in this browser.';
            this.isFetching = false;
        }
    }

    @Output() geoLocationReceived: EventEmitter<{ lat: number, lng: number }> = new EventEmitter();
}