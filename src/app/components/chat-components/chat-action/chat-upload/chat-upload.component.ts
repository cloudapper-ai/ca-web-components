/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject } from "rxjs";
import { FileToImageDirective } from "../../../../components/directives/file-to-image.directive";
import { IsNullOrUndefinedOrEmptyString } from "../../../../helpers/helper-functions.helper";
import { Assets } from "../../../../models/assets.model";
import { ActionAttachmentAttributes } from "../../../../models/chat-message.model";
import { FileSizePipe } from "../../../../pipes/filesize.pipe";
import { getFileExtension } from "../../../../helpers/attachment-helpers.helper";
import { EnumFileUploadStatus, FileInformation } from "../../../../models/file-data.model";


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
                if (value.SupportedFileTypes !== '*/*') {
                    value.SupportedFileTypes.split(new RegExp('[,;]', 'gi')).map(x => x.trim()).filter(x => !IsNullOrUndefinedOrEmptyString(x)).forEach(x => {
                        if (fileTypes.length > 0) { fileTypes += ','; }
                        if (x.startsWith('.')) { fileTypes += x; }
                        else { fileTypes += `.${x}`; }
                    })
                }

                this.supportedFiles = fileTypes;
            } else {
                this.supportedFiles = '*/*'
            }
            this.maxFileSize = value.MaxFileSizeInMb || 200;
        })
    }

    protected maxFileSize: number = 200;
    protected supportedFiles = '*/*'


    private data$: BehaviorSubject<ActionAttachmentAttributes> = new BehaviorSubject(<ActionAttachmentAttributes>{
        MaxFileSizeInMb: 200
    })
    @Input()
    get data(): ActionAttachmentAttributes { return this.data$.getValue(); }
    set data(value: ActionAttachmentAttributes) { this.data$.next(value); }

    @Input() primaryColor: string = '#434'

    protected onFileSelected(event: any) {
        const files = event.target.files;
        this.addFilesinList(files)
    }

    @ViewChild('fileInput') fileInput?: ElementRef;


    private verifyAndAddAfile(file: File) {
        if (file.size / 1024 / 1024 > this.maxFileSize) {
            this.setErrorMessage('File size limit exceeded.')
        } else {
            const ext = getFileExtension(file.name);
            const invalidFileformat = this.supportedFiles && this.supportedFiles !== '*/*' && ext && !this.supportedFiles.includes(ext);
            if (invalidFileformat) {
                this.setErrorMessage('The supported formats does not include this file format.')
            } else {
                if (!this.filelist.find(x => x.file.name === file.name && x.file.type === file.type && x.file.size === file.size)) {
                    this.filelist.push(new FileInformation(file));
                }
            }

        }


    }

    protected fileSelectionError?: string = undefined;

    private setErrorMessage(message: string) {
        this.fileSelectionError = message
        setTimeout(() => {
            this.fileSelectionError = undefined;
        }, 3000)
    }

    onDrop(event: any) {
        const files: FileList = event.dataTransfer.files;
        this.addFilesinList(files);
        event.preventDefault();
    }

    private addFilesinList(files: FileList) {
        if (files && files.length) {
            for (let i = 0; i < files.length; i++) {
                const file = files.item(i);
                if (file) {
                    setTimeout(() => { this.verifyAndAddAfile(file); }, i * 100);
                }
            }
        }


        if (this.fileInput) (this.fileInput.nativeElement as HTMLInputElement).value = '';
    }

    onDragOver(event: any) {
        event.preventDefault();
    }


    @Output() fileSubmitted: EventEmitter<{
        files: FileInformation[],
        subscriber: BehaviorSubject<FileInformation | undefined>
    }> = new EventEmitter();

    protected isUploading = false;
    private subject = new BehaviorSubject<FileInformation | undefined>(undefined);
    protected onSubmitFile() {
        if (this.filelist.length < 1) { return; }
        this.isUploading = true;
        this.subject.unsubscribe();
        this.subject = new BehaviorSubject<FileInformation | undefined>(undefined);
        this.subject.pipe(untilDestroyed(this)).subscribe(info => {
            if (info) {
                const index = this.filelist.findIndex(x => x.id === info.id);
                if (index !== -1) {
                    this.filelist.splice(index, 1, info);
                }
            }
            this.isUploading = this.filelist.find(x => x.uploadStatus === EnumFileUploadStatus.Uploading) !== undefined;
        })
        this.fileSubmitted.next({
            files: this.filelist,
            subscriber: this.subject
        })

    }

    protected selectedFile: File | null = null;
    protected filelist: FileInformation[] = [];

    protected removeFileFromlist(file: FileInformation) {
        const index = this.filelist.findIndex(x => x.id === file.id);
        if (index !== -1) {
            this.filelist.splice(index, 1);
        }
    }

    protected trackfilelist(index: number, file: FileInformation) {
        return file.id;
    }

    protected UploadStatus = EnumFileUploadStatus;
}