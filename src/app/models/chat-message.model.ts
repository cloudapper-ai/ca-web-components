export class ChatMessage {
    public loading: boolean = false;
    public warning: boolean = false;
    public updateCount: number = 0;
    public suggestions?: string[];
    constructor(public id: string, public userId: string, public message: string) { }
}

export enum EnumChatUserRoles {
    User = 'user',
    Assistant = 'assistant'
}

export class ChatHistory {
    constructor(public role: EnumChatUserRoles, public content: string) { }
}


export class StreamChatMessageData {
    constructor(public content?: string | null, public finish_reason?: string | null, public error?: string | null) { }
}

export class StreamChatCacheData {
    constructor(public content?: any | null, public finish_reason?: string | null, public error?: string | null) { }
}

export class ChatResponse {
    constructor(public query_result?: string | null, public generated_question?: string | null, public query_time?: number) { }
}

export interface ChatResponseStream {
    message: StreamChatMessageData
    cache: StreamChatCacheData
}