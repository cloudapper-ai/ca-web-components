export class ChatColorProfile {
    constructor(public labelColor: string, public textColor: string, public backgroundColor: string) {}
}

export class ChatWindowColorProfile {
    constructor(public primaryColor: string, public onPrimaryColor: string, public secondaryColor: string) {}
}

export class ChatBoxInputs {
    constructor(
        public title: string, 
        public userName: string,
        public botName: string,
        public windowColors: ChatWindowColorProfile, 
        public userColors: Record<string, ChatColorProfile>,
        public cancelOnClickOutside: boolean){}
}

export enum EnumWindowPosition { 
    BottomLeft = 'BOTTOM_LEFT',
    BottomRight = 'BOTTOM_RIGHT'
}