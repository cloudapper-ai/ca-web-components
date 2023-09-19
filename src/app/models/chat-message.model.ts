export class ChatMessage {
    public loading: boolean = false;
    public warning: boolean = false;
    public updateCount: number = 0;
    public suggestions?: string[];
    constructor(public id: string, public userId: string, public message: string) {}
}

export enum EnumChatUserRoles { 
    User = 'user',
    Assistant = 'assistant'   
}

export class ChatHistory {
    constructor(public role: EnumChatUserRoles, public content: string) {}
}