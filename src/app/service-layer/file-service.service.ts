import { Inject, Injectable } from "@angular/core";
import { IFileService } from "../data-layer/interfaces/file-service.interface";
import { TOKEN_FILE_SERVICE } from "../data-layer/interfaces/injectable-token.token";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class FileService {
    constructor(@Inject(TOKEN_FILE_SERVICE) private service: IFileService) { }

    updateEndpoint(url: string, identifier: string) {
        this.service.updateEndpointSetting(url, identifier);
    }

    uploadfile(file: File): Observable<string> {
        return new Observable(observer => {
            this.service.uploadFile(file).subscribe({
                next: (data) => {
                    if (data && data.Result && !data.Result.isUploadProgress) {
                        const url = data.Result.url || ''
                        if (url && url.length) {
                            observer.next(url);
                        } else {
                            observer.error('Failed to upload file.')
                        }
                    }
                },
                error: (reason) => {
                    observer.error(reason);
                }
            })
        })
    }
}