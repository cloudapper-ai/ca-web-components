
import { uuidv4 } from "../helpers/utils";

export class BaseModel {
    Id!: string;
    CreatedBy!: string;
    CreateDate!: string;
    LastModifiedBy!: string;
    LastModifiedDate!: string;
}

export class CloudFile extends BaseModel {
    id!: string;
    TemplateId!: string;
    FileName!: string;
    OriginalFileName!: string;
    FileType!: string;
    CloudFileType!: EnumCloudApperFileType;
    RecordId?: string;
    ClientId?: number;
    AppId?: string;
    FileContent!: string;
    FileExtension!: string;
    FileSizeInKB!: number;
    OriginalURL!: string;
    ThumbnailURL!: string;
    Description!: string;
    _version_!: number;
    LanguageCode!: string;
    UserId!: string;
}

export interface IFileProgressData {
    isUploadProgress?: boolean,
    uploadPercent?: number,
    url?: string;
    videoInfo?: any;
}


export enum EnumCloudApperFileType {
    None = 0,
    RecordControlFile = 1, // Record UI element file(image control)
    RecordFile = 2, // Record file/photo tab
    RepositoryFile = 3,
    RecordDisplayPicture = 4, // Profile picture
    AppLogo = 5, // Applogo
    UserProfilePicture = 6,
    MenuIcon = 7,
    Multimedia = 8, // For Multimedia control
    ClientLogo = 9,
    GalleryAppLogo = 10, // template upload/download logos, screenschoot
    LayoutMap = 11,
    EasyStreetDrawing = 12
}

export enum EnumSharingLevel {
    None = 0,
    UserLevel = 1,
    AppLevel = 2,
    ClientLevel = 3
}
export interface IFileResponseModel {
    id: string;
    CloudApperFileType: EnumCloudApperFileType;
    AppId: string;
    ClientId: number;
    FileName: string;
    FileType: string;
    FileExtension: string;
    FileSizeInKB: number;
    OriginalURL: string;
    ThumbnailURL: string;
    SharingLevel: EnumSharingLevel;
    CategoryId: string;
    _version_: number;
    CreatedBy: string;
    CreateDate: Date;
    LastModifiedDate: Date;
}


export class FileInformation {
    public id: string = uuidv4()
    public uploadError?: string;
    public uploadStatus: EnumFileUploadStatus = EnumFileUploadStatus.None;
    public url?: string;
    constructor(public file: File) { }
}

export enum EnumFileUploadStatus {
    None = 0,
    Uploading = 1,
    Uploaded = 2,
    UploadFailed = 3
}