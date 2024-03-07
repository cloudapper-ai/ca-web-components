/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject } from "rxjs";
import { FileToImageDirective } from "../../../directives/file-to-image.directive";
import { IsNullOrUndefinedOrEmptyString } from "../../../../helpers/helper-functions.helper";
import { ActionAttachmentAttributes } from "../../../../models/chat-message.model";
import { FileSizePipe } from "../../../../pipes/filesize.pipe";
import { Assets } from "../../../../models/assets.model";

@UntilDestroy()
@Component({
    selector: 'chat-upload',
    templateUrl: './chat-upload.component.html',
    styleUrls: ['./chat-upload.component.css'],
    standalone: true,
    imports: [CommonModule, FileToImageDirective, FileSizePipe]
})
export class ChatUploadComponent implements OnInit {
    protected Assets = Assets
    ngOnInit(): void {
        this.data$.pipe(untilDestroyed(this)).subscribe(value => {
            if (value.SupportedFileTypes && value.SupportedFileTypes.length) {
                let fileTypes = ''
                value.SupportedFileTypes.split(',').map(x => x.trim()).filter(x => !IsNullOrUndefinedOrEmptyString(x)).forEach(x => {
                    if (fileTypes.length > 0) { fileTypes += ','; }
                    fileTypes += `.${x}`;
                })
                this.supportedFiles = fileTypes;
            } else {
                this.supportedFiles = '*/*'
            }
            this.maxFileSize = value.MaxFileSizeInMb || 200;
        })
    }

    protected errorMessage?: string = undefined;
    protected maxFileSize: number = 200;
    protected supportedFiles = '*/*'


    private data$: BehaviorSubject<ActionAttachmentAttributes> = new BehaviorSubject(<ActionAttachmentAttributes>{
        MaxFileSizeInMb: 200
    })
    @Input()
    get data(): ActionAttachmentAttributes { return this.data$.getValue(); }
    set data(value: ActionAttachmentAttributes) { this.data$.next(value); }

    @Input() primaryColor: string = '#434'

    protected UploadStatus = ChatUploadStatus;
    protected currentStatus = ChatUploadStatus.None;

    protected onFileSelected(event: any) {
        const files = event.target.files;
        if (files && files.length) {
            this.selectAFile(files[0])
        }
    }

    @ViewChild('fileInput') fileInput?: ElementRef;

    private selectAFile(file: File) {
        if (file.size / 1024 / 1024 > this.maxFileSize) {
            this.setErrorMessage('File size limit exceeded.')
        } else {
            this.selectedFile = file;
            this.currentStatus = ChatUploadStatus.FileReceived;
        }
    }

    private setErrorMessage(message: string) {
        this.errorMessage = message
        this.currentStatus = ChatUploadStatus.UploadFailed;
        setTimeout(() => {
            if (this.fileInput) (this.fileInput.nativeElement as HTMLInputElement).value = '';
            this.errorMessage = undefined;
            this.currentStatus = ChatUploadStatus.None;
            this.selectedFile = null;
        }, 3000)
    }

    onDrop(event: any) {
        const files: FileList = event.dataTransfer.files;
        if (files && files.length) {
            const file = files.item(0);
            if (file) {
                this.selectAFile(file)
            }

        }
        event.preventDefault();
    }

    onDragOver(event: any) {
        event.preventDefault();
    }


    @Output() fileSelected: EventEmitter<{
        file: File,
        subscriber: BehaviorSubject<string | undefined>
    }> = new EventEmitter();
    private subject = new BehaviorSubject<string | undefined>(undefined);
    protected onSubmitFile() {
        if (this.currentStatus !== ChatUploadStatus.FileReceived || !this.selectedFile) { return; }
        this.currentStatus = ChatUploadStatus.Uploading

        this.subject.unsubscribe();
        this.subject = new BehaviorSubject<string | undefined>(undefined);
        this.subject.pipe(untilDestroyed(this)).subscribe(reason => {
            if (reason) {
                this.setErrorMessage(reason)
            }
        })
        this.fileSelected.next({
            file: this.selectedFile,
            subscriber: this.subject
        })

    }

    protected selectedFile: File | null = null;

}

export enum ChatUploadStatus {
    None = 0,
    FileReceived = 1,
    Uploading = 2,
    Uploaded = 3,
    UploadFailed = 4
}