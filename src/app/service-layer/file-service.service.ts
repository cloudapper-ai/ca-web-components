import { Inject, Injectable } from "@angular/core";
import { IFileService } from "../data-layer/interfaces/file-service.interface";
import { TOKEN_FILE_SERVICE } from "../data-layer/interfaces/injectable-token.token";
import { Observable } from "rxjs";
import { EnumFileUploadStatus, FileInformation } from "../models/file-data.model";

@Injectable({ providedIn: 'root' })
export class FileService {
    constructor(@Inject(TOKEN_FILE_SERVICE) private service: IFileService) { }

    updateEndpoint(url: string, identifier: string) {
        this.service.updateEndpointSetting(url, identifier);
    }

    uploadfile(file: FileInformation): Observable<FileInformation> {
        return new Observable(observer => {
            file.uploadStatus = EnumFileUploadStatus.Uploading;
            observer.next({ ...file })
            this.service.uploadFile(file.file).subscribe({
                next: (data) => {
                    if (data && data.Result && !data.Result.isUploadProgress) {
                        const url = data.Result.url || ''
                        if (url && url.length) {
                            file.uploadStatus = EnumFileUploadStatus.Uploaded;
                            file.url = url;
                            observer.next({ ...file })
                        } else {
                            file.uploadStatus = EnumFileUploadStatus.UploadFailed;
                            file.uploadError = 'Failed to upload file.';
                            observer.next({ ...file })
                        }

                        observer.complete();
                    }
                },
                error: (reason) => {
                    file.uploadStatus = EnumFileUploadStatus.UploadFailed;
                    file.uploadError = reason ? reason : 'Failed to upload file.';
                    observer.next({ ...file });
                    observer.complete();
                }
            })
        })
    }
}