import { Observable } from "rxjs";
import { ApiServerResponse } from "../../models/api-result.model";
import { IFileProgressData } from "../../models/file-data.model";

export interface IFileService {
    updateEndpointSetting(url: string, identifier: string): void
    uploadFile(file: File): Observable<ApiServerResponse<IFileProgressData | null>>
}