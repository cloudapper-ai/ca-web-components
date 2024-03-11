/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject } from "rxjs";
import { AudioRecordingModule } from "../../../../components/shared-components/audio-recording/audio-recording.module";
import { Assets } from "../../../../models/assets.model";

@UntilDestroy()
@Component({
    selector: 'chat-audio-recorder',
    templateUrl: './chat-audio.component.html',
    styleUrls: ['./chat-audio.component.css'],
    standalone: true,
    imports: [CommonModule, AudioRecordingModule]
})
export class ChatAudioComponent implements OnInit {
    protected Assets = Assets
    ngOnInit(): void {
        this.error$.pipe(untilDestroyed(this)).subscribe(error => {
            if (error) {
                setTimeout(() => { this.error$.next(null); }, 3000);
            }
        })
        this.file$.pipe(untilDestroyed(this)).subscribe(file => {
            this.isUploading = false;
            if (file) {
                this.error$.next(null)
                this.getContentUrl(file).then(x => this.audioUrl$.next(x)).catch(reason => {
                    this.audioUrl$.next(null);
                    this.error$.error(reason);
                })
            } else {
                this.error$.next(null);
                this.audioUrl$.next(null);
            }
        })
    }

    private getContentUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string);
            }
            reader.onerror = () => {
                reject('Unable to read file content');
            }
            reader.readAsDataURL(file);
        })
    }

    protected reset() {
        this.isUploading = false;
        this.error$.next(null);
        this.audioUrl$.next(null);
    }

    protected isUploading = false;
    protected audioUrl$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    protected error$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    private file$: BehaviorSubject<File | null> = new BehaviorSubject<File | null>(null);
    protected onReceiveFile(file: File | null) {
        this.file$.next(file)
    }

    @Output() fileSelected: EventEmitter<{
        file: File,
        subscriber: BehaviorSubject<string | undefined>
    }> = new EventEmitter();
    private subject = new BehaviorSubject<string | undefined>(undefined);
    protected onSubmitFile() {
        const file = this.file$.getValue();
        if (!file) { return; }
        if (this.isUploading) { return; }
        this.isUploading = true;

        this.subject.unsubscribe();
        this.subject = new BehaviorSubject<string | undefined>(undefined);
        this.subject.pipe(untilDestroyed(this)).subscribe(reason => {
            if (reason) {
                this.isUploading = false;
                this.error$.next(reason);
            }
        })
        this.fileSelected.next({
            file: file,
            subscriber: this.subject
        })

    }

    @Input() primaryColor: string = '#ddd';
    @Input() maxRecordingDurationInSec: number = 60;
    @Input() maxFileSizeInMb: number = 200;
}