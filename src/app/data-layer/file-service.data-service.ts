import { Observable } from "rxjs";
import { ApiServerResponse, NetworkError, ServerError } from "../models/api-result.model";
import { CloudFile, EnumCloudApperFileType, IFileProgressData, IFileResponseModel } from "../models/file-data.model";
import { IFileService } from "./interfaces/file-service.interface";
import { getFileExtension } from "../helpers/attachment-helpers.helper";
import { uuidv4 } from "../helpers/utils";
import { HttpClient, HttpErrorResponse, HttpEventType } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class FileDataService implements IFileService {
    private readonly UploadAPI = 'api/v2.0/hook/upload-file';
    private FileUploadEndpoint: string;
    constructor(private http: HttpClient) {
        this.FileUploadEndpoint = this.UploadAPI;
    }

    private identifier: string = '';

    updateEndpointSetting(url: string, identifier: string) {
        if (url.endsWith('/')) {
            this.FileUploadEndpoint = `${url}${this.UploadAPI}`;
        } else {
            this.FileUploadEndpoint = `${url}/${this.UploadAPI}`;
        }
        this.identifier = identifier;
    }

    uploadFile(file: File): Observable<ApiServerResponse<IFileProgressData | null>> {
        const cloudFile = new CloudFile();
        cloudFile.id = uuidv4();
        cloudFile.OriginalFileName = file.name;
        cloudFile.FileExtension = getFileExtension(file.name) ?? '';
        cloudFile.FileSizeInKB = parseInt((file.size / 1024).toString());
        cloudFile.FileType = file.type;
        cloudFile.CloudFileType = EnumCloudApperFileType.RepositoryFile;
        const blobfileInfo = new Blob([JSON.stringify(cloudFile)], {
            type: 'application/json'
        });
        const formData = new FormData();
        const fileToUpload = <File>file;
        formData.append('file', fileToUpload, fileToUpload.name);
        formData.append('FileInfo', blobfileInfo, 'Info');


        return new Observable(observer => {
            this.http.post(
                this.FileUploadEndpoint,
                formData,
                {
                    headers: {
                        'identifier': this.identifier
                    },
                    reportProgress: true,
                    observe: 'events',
                })
                .subscribe({
                    next: (response) => {
                        if (response) {
                            let result: ApiServerResponse<IFileProgressData | null>;

                            if (response.type === HttpEventType.UploadProgress) {
                                const uploadPercent = Math.round(
                                    (100 * response.loaded) / (response.total || 0)
                                );

                                const progressData: IFileProgressData = { isUploadProgress: true, uploadPercent };

                                result = (ApiServerResponse<IFileProgressData | null>)
                                    .from({ Success: true, ResponseCode: 200, Message: `${uploadPercent}%`, Result: progressData });
                                observer.next(result);
                            } else if (response.type === HttpEventType.Response) {
                                if (response.body) {
                                    const apiResult = (ApiServerResponse<string>).from(response.body as any)
                                    if (apiResult.Success) {
                                        const progressData: IFileProgressData = { isUploadProgress: false, url: apiResult.Result ? (apiResult.Result as string) : '' };
                                        if (progressData.url) {
                                            result = (ApiServerResponse<IFileProgressData | null>)
                                                .from({ Success: true, ResponseCode: 200, Message: 'File is uploaded successfully.', Result: progressData });
                                            observer.next(result);
                                        } else {
                                            observer.error(new ServerError(400).getErrorMessage());
                                        }
                                    } else {
                                        observer.error(new ServerError(apiResult.ResponseCode, apiResult.Message ?? undefined).getErrorMessage())
                                    }

                                } else {
                                    observer.error(new ServerError(500).getErrorMessage());
                                }

                                observer.complete();

                            } else {
                                result = (ApiServerResponse<IFileProgressData | null>)
                                    .from({ Success: true, ResponseCode: 200, Message: '', Result: null });
                                observer.next(result);
                            }
                        } else {
                            observer.error(new ServerError(500).getErrorMessage());
                            observer.complete();
                        }
                    },
                    error: (error: HttpErrorResponse) => {
                        observer.error(new NetworkError(error.status, error.message).getErrorMessage());
                        observer.complete();
                    }
                });
        });


    }


}