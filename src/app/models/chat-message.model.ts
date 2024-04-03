export class ChatMessage {
    public loading: boolean = false;
    public warning: boolean = false;
    public updateCount: number = 0;
    public suggestions?: string[];
    public action?: ChatUIActionData;
    constructor(public id: string, public userId: string, public message: string) { }

    public style: EnumChatMessagePreviewType = EnumChatMessagePreviewType.Default;
}

export enum EnumChatMessagePreviewType {
    Default = 1,
    Pill = 2
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

export class ChatResponse {
    constructor(public query_result?: string | null, public generated_question?: string | null, public query_time?: number) { }
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
    CreateSchedule = "CREATE_SCHEDULE"
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

export interface ActionViewRecordsAttributes {
    Id: string;
    DisplayName: string;
    TypeId: string;
    AppId: string;
    ClientId: number;
}
export interface ChatUIActions {
    actions: ChatUIActionData[];
}
export interface ChatUIActionData {
    ActionType: EnumChatActionTypes;
    ActionAttachmentAttributes?: ActionAttachmentAttributes;
    ActionChoiceAttributes?: ActionChoiceAttributes;
    ActionScheduleAttributes?: ActionScheduleAttributes;
    ActionViewRecordsAttributes?: ActionViewRecordsAttributes[];
}

export interface ChatResponseStream {
    message: StreamChatMessageData
    cache: StreamChatCacheData
    uiaction: StreamChatActionData
}