import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Assets } from "../../../../models/assets.model";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { EnumFileUploadStatus, FileInformation } from "../../../../models/file-data.model";

@UntilDestroy()
@Component({
    selector: 'chat-photo',
    templateUrl: './chat-photo.component.html',
    styleUrls: ['./chat-photo.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ChatPhotoComponent {
    constructor(private sanitizer: DomSanitizer) { }

    @Input() disableSwitchingCamera: boolean = false;
    @Output() capturePhotoRequested: EventEmitter<BehaviorSubject<File | undefined>> = new EventEmitter();
    @Output() submitPhoto = new EventEmitter<{
        files: FileInformation[],
        subscriber: BehaviorSubject<FileInformation | undefined>
    }>();

    protected error$ = new BehaviorSubject<string | undefined>(undefined);

    protected Assets = Assets;
    private get error(): string | undefined {
        return this.error$.getValue();
    }

    private set error(value: string) {
        this.error$.next(value); setTimeout(() => {
            this.error$.next(undefined)
        }, 3000);
    }


    protected subject = new BehaviorSubject<File | undefined>(undefined);

    protected requestPhotoCapture() {
        this.subject.unsubscribe();
        this.subject = new BehaviorSubject<File | undefined>(undefined);
        this.subject.pipe(untilDestroyed(this)).subscribe({
            next: file => {
                if (file) {
                    this.subject.unsubscribe();
                    this.submitPhotoFile(file);
                }
            },
            error: (err) => {
                this.error = err.message || err
            },
        });
        this.capturePhotoRequested.next(this.subject);
    }
    protected isUploading: boolean = false;
    protected uploadSubject = new BehaviorSubject<FileInformation | undefined>(undefined);
    protected submitPhotoFile(file: File) {
        this.uploadSubject.unsubscribe();
        this.uploadSubject = new BehaviorSubject<FileInformation | undefined>(undefined);
        this.uploadSubject.pipe(untilDestroyed(this)).subscribe(result => {
            if (result) {
                this.isUploading = result.uploadStatus === EnumFileUploadStatus.Uploading;
                const error = result.uploadError || null;

                if (error) {
                    this.error = error;
                }

            }
        });
        this.submitPhoto.next({
            files: [new FileInformation(file)],
            subscriber: this.uploadSubject
        })
    }

}