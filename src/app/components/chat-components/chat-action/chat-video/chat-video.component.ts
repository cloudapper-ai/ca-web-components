/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject } from "rxjs";
import { Assets } from "../../../../models/assets.model";

@UntilDestroy()
@Component({
    selector: 'chat-video-recorder',
    templateUrl: './chat-video.component.html',
    styleUrls: ['./chat-video.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ChatVideoComponent implements OnInit {
    protected Assets = Assets;
    @Input() primaryColor: string = '#ddd'
    @Input() durationInSec: number = 300;
    @Input() maximumFileSizeInMb: number = 200;
    private _uploadError: string | null = null;
    @Input()
    get uploadError(): string | null { return this._uploadError; }
    set uploadError(value: string | null) {
        this.isUploading = false;
        this._uploadError = value; this.error = value;
        setTimeout(() => {
            this.error = null;
        }, 3000);
    }

    @Output() readyToRecordVideo = new EventEmitter<BehaviorSubject<File | null>>();

    private videoFile$ = new BehaviorSubject<File | null>(null);
    @Input()
    get videoFile(): File | null { return this.videoFile$.getValue(); }
    set videoFile(value: File | null) { this.videoFile$.next(value); }

    @Output() fileSelected: EventEmitter<{
        file: File,
        subscriber: BehaviorSubject<string | undefined>
    }> = new EventEmitter();
    private subject = new BehaviorSubject<string | undefined>(undefined);
    protected onSubmitFile() {
        const file = this.videoFile;
        if (!file) { return; }
        if (this.isUploading) { return; }
        this.isUploading = true;

        this.subject.unsubscribe();
        this.subject = new BehaviorSubject<string | undefined>(undefined);
        this.subject.pipe(untilDestroyed(this)).subscribe(reason => {
            if (reason) {
                this.isUploading = false;
                this.error = reason;
                setTimeout(() => {
                    this.error = null;
                }, 3000);
            }
        })
        this.fileSelected.next({
            file: file,
            subscriber: this.subject
        })

    }

    protected startRecording() {
        this.readyToRecordVideo.next(this.videoFile$);
        this.isRecording = true;
    }

    protected isUploading: boolean = false;
    protected isRecording: boolean = false;
    protected contentUrl: string | null = null;
    protected error: string | null = null;

    ngOnInit(): void {
        this.videoFile$.pipe(untilDestroyed(this)).subscribe(file => {
            this.isRecording = false;
            this.isUploading = false;

            if (file) {
                this.readFileAsUrl(file)
                    .then(url => {
                        this.contentUrl = url;
                        this.error = null;
                    })
                    .catch(reason => {
                        this.contentUrl = null;
                        this.error = reason;
                        setTimeout(() => {
                            this.error = null;
                        }, 3000);
                    })
            } else {
                this.contentUrl = null;
                this.error = null;
            }
        })
    }

    private readFileAsUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result as string);
            }

            reader.onerror = () => {
                reject("We were unable read contents of the recording.");
            }

            reader.readAsDataURL(file);
        });
    }
}