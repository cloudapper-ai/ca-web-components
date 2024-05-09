export class ChatMessage {
    public loading: boolean = false;
    public warning: boolean = false;
    public updateCount: number = 0;
    public suggestions?: string[];
    public suggestionObjects?: ChatSuggestion[];
    public action?: ChatUIActionData;
    constructor(public id: string, public userId: string, public message: string) { }

    private _queryText: string | undefined = undefined;
    public get QueryText(): string { return this._queryText ? this._queryText : this.message; }
    public set QueryText(value: string | undefined) { this._queryText = value; }

    public style: EnumChatMessagePreviewType = EnumChatMessagePreviewType.Default;
}

export enum EnumChatMessagePreviewType {
    Default = 1,
    Pill = 2,
    Attachment = 3,
    Location = 4,
    Code = 5,
    Secret = 6
}

export enum EnumChatUserRoles {
    User = 'user',
    Assistant = 'assistant'
}

export class ChatHistory {
    constructor(public role: EnumChatUserRoles, public content: string) { }
}


export class StreamChatMessageData {
    constructor(public content?: string | null, public finish_reason?: string | null, public error?: any | null) { }
}

export class StreamChatCacheData {
    constructor(public content?: any | null, public finish_reason?: string | null, public error?: string | null) { }
}

export class StreamChatActionData {
    constructor(public content?: ChatUIActions | null, public finish_reason?: string | null, public error?: string | null) { }
}

export class StreamChatSuggestionData {
    constructor(public content?: ChatSuggestion[] | null, public finish_reason?: string | null, public error?: string | null) { }
}

export class ChatResponse {
    constructor(public query_result?: string | null, public generated_question?: string | null, public query_time?: number) { }
}

export interface ChatSuggestion {
    identifier: string;
    parent_id: string;
    display_text: string;
    query_text: string;

}

export enum EnumChatActionTypes {
    None = "None",
    ShowRecord = "SHOW_RECORD",
    ShowRecords = "SHOW_RECORDS",
    RecordVideo = "RECORD_VIDEO",
    RecordAudio = "RECORD_AUDIO",
    UploadFile = "UPLOAD_FILE",
    ChooseOption = "CHOOSE_OPTION",
    ChooseOptions = "CHOOSE_OPTIONS",
    CreateSchedule = "CREATE_SCHEDULE",
    TakePicture = "TAKE_PICTURE",
    FaceCapture = "SCAN_FACE_IMAGE",
    ReadPIN = "READ_PIN",
    ScanQRCode = "SCAN_CODE",
    ScanDocument = "SCAN_DOCUMENT",
    ShareLocation = "LOCATION_SHARE"
}

export interface ActionAttachmentAttributes {
    MaxFileSizeInMb: number;
    SupportedFileTypes?: string; //mp4, mp3
    DurationInSec: number;
}

export interface ActionChoiceAttributes {
    Choices: string; // choices will be separated by semi-colon (;). e.g. Choice 1;Choice 2
}

export interface ActionScheduleAttributes {
    // Title: string; // 1st Interview: Introductory Session
    // Duration: string; // 30min
    // Slots: string[]; // An array of utc date string, this time will begin from current day to 2 months onward
    ScheduleEventLink: string;
    ScheduleCompleteRedirectionLink: string;
    OnCompleteMessageFormat: string;

    // "ScheduleEventLink": "https://calendly.com/biswajit/javadev",

    // "ScheduleCompleteRedirectionLink": "https://calendly.com/biswajit/javadev/invitee/{{$identifier}}",
    // "OnCompleteMessageFormat": "I have scheduled in your calendar. Please confirm. Event Id: {{$Identifier}}"
}

export type PrimitiveData = boolean | string | number | string[];
export type DynamicObject = { [key: string]: PrimitiveData }
export type AnyObject = { [key: string]: PrimitiveData | DynamicObject | DynamicObject[] };

export interface ActionListAttributes {
    RecordList: DynamicObject[]
    // Id: string;
    // DisplayName: string;
    // TypeId: string;
    // AppId: string;
    // ClientId: number;
}

export class ActionRecordViewAttributes {
    constructor(public Id: string, public TypeId: string, public AppId: string, public ClientId: number, public DisplayName: string) { }

    static get(record: DynamicObject): ActionRecordViewAttributes | null {
        const id = record['id'] as string;
        const typeId = record['TypeId'] as string;
        const appId = record['AppId'] as string;
        const clientId = record['ClientId'] as number;
        const displayName = record['DisplayName'] as string;

        if (id && typeId && clientId && appId) {
            return new ActionRecordViewAttributes(id, typeId, appId, clientId, displayName ? displayName === '__null__' ? 'Not provided' : displayName : 'Not provided')
        }

        return null;
    }
}

export interface ActionImageDataAttributes {
    DisableSwitchingCamera: boolean;
    IsDefaultToFrontCamera: boolean;
    CodeFormat?: string;
}

export interface ActionReadPinAttributes {
    Title: string;
    Subtitle?: string;
    IsAlphaNumericPin: boolean;
    PinLength: number;
}

export interface ChatUIActions {
    actions: ChatUIActionData[];
}
export interface ChatUIActionData {
    ActionType: EnumChatActionTypes;
    ActionAttachmentAttributes?: ActionAttachmentAttributes;
    ActionChoiceAttributes?: ActionChoiceAttributes;
    ActionScheduleAttributes?: ActionScheduleAttributes;
    ActionListAttributes?: ActionListAttributes;
    CaptureImageDataAttributes?: ActionImageDataAttributes;
    ReadPinCodeAttributes?: ActionReadPinAttributes;
}

export interface ChatResponseStream {
    message: StreamChatMessageData
    cache: StreamChatCacheData
    uiaction: StreamChatActionData
    suggestions: ChatSuggestion[]
}