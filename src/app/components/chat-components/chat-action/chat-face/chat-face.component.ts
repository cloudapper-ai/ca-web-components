import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Assets } from "../../../../models/assets.model";
import { ActionImageDataAttributes } from "../../../../models/chat-message.model";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject } from "rxjs";
import { FileInformation, EnumFileUploadStatus } from "src/app/models/file-data.model";

@UntilDestroy()
@Component({
    selector: 'chat-face',
    templateUrl: './chat-face.component.html',
    styleUrls: ['./chat-face.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class ChatFaceComponent {
    @Input() setting: ActionImageDataAttributes = <ActionImageDataAttributes>{
        IsDefaultToFrontCamera: true,
        DisableSwitchingCamera: false
    };
    @Output() requestFacescan = new EventEmitter<{
        setting: ActionImageDataAttributes,
        subject: BehaviorSubject<File | undefined>
    }>();

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
        this.requestFacescan.next({
            setting: this.setting,
            subject: this.subject
        });
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