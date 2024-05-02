/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject } from "rxjs";
import { Assets } from "../../../../models/assets.model";
import { VideoFile } from "../../../../helpers/attachment-helpers.helper";
import { FileInformation, EnumFileUploadStatus } from "../../../../models/file-data.model";

@UntilDestroy()
@Component({
    selector: 'chat-video-recorder',
    templateUrl: './chat-video.component.html',
    styleUrls: ['./chat-video.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ChatVideoComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
        if (this.contentUrl) {
            URL.revokeObjectURL(this.contentUrl)
        }
    }
    protected Assets = Assets;
    @Input() primaryColor: string = '#ddd'
    @Input() durationInSec: number = 300;
    @Input() maximumFileSizeInMb: number = 200;

    @Output() readyToRecordVideo = new EventEmitter<BehaviorSubject<File | null>>();

    private videoFile$ = new BehaviorSubject<File | null>(null);
    @Input()
    get videoFile(): File | null { return this.videoFile$.getValue(); }
    set videoFile(value: File | null) { this.videoFile$.next(value); }

    @Output() fileSubmitted: EventEmitter<{
        files: FileInformation[],
        subscriber: BehaviorSubject<FileInformation | undefined>
    }> = new EventEmitter();
    private subject = new BehaviorSubject<FileInformation | undefined>(undefined);
    protected onSubmitFile() {
        const file = this.videoFile;
        if (!file) { return; }
        if (this.isUploading) { return; }
        this.isUploading = true;

        this.subject.unsubscribe();
        this.subject = new BehaviorSubject<FileInformation | undefined>(undefined);
        this.subject.pipe(untilDestroyed(this)).subscribe(result => {
            if (result) {
                this.isUploading = result.uploadStatus === EnumFileUploadStatus.Uploading;
                this.error = result.uploadError || null;
                if (this.error) {
                    setTimeout(() => {
                        this.error = null;
                    }, 3000);
                }

            }
        })
        this.fileSubmitted.next({
            files: [new FileInformation(file)],
            subscriber: this.subject
        })
    }

    protected startRecording() {
        this.videoFile$.next(null);
        this.isRecording = true;
        this.readyToRecordVideo.next(this.videoFile$);
    }

    protected isUploading: boolean = false;
    protected isRecording: boolean = false;
    protected contentUrl: string | null = null;
    protected showImagepreview: boolean = false;
    protected error: string | null = null;

    @ViewChild('videoElement') element?: ElementRef;

    ngOnInit(): void {
        this.videoFile$.pipe(untilDestroyed(this)).subscribe({
            next: file => {
                if (this.contentUrl) {
                    URL.revokeObjectURL(this.contentUrl);
                }
                this.isRecording = false;
                this.isUploading = false;
                this.showImagepreview = false;
                if (file) {
                    if (this.element) {
                        this.showImagepreview = !(this.element.nativeElement as HTMLVideoElement).canPlayType(file.type)
                    }
                    this.readFileAsUrl(file)
                        .then(url => {
                            this.contentUrl = url;
                            this.error = null;
                        })
                } else {
                    this.contentUrl = null;
                    this.error = null;
                }

            },
            error: error => {
                this.error = error;
                this.contentUrl = null;
                setTimeout(() => { this.error = null; }, 3000)
            }
        })
    }

    private readFileAsUrl(file: File): Promise<string> {
        return new Promise((resolve) => {
            // const reader = new FileReader();

            // reader.onload = () => {
            //     resolve(reader.result as string);
            // }

            // reader.onerror = () => {
            //     reject("We were unable read contents of the recording.");
            // }

            // reader.readAsDataURL(file);
            resolve(URL.createObjectURL(file))
        });
    }

    protected VideoFileIcon = VideoFile;
}