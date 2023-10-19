import { Observable, takeWhile } from "rxjs";
import { IChatService } from "../data-layer/interfaces/chat-service.interface";
import { ChatHistory, EnumChatUserRoles } from "../models/chat-message.model";
import { RESULT } from "../models/result.model";
import { uuidv4 } from "./utils";

export class ChatService {
    constructor(private dataService: IChatService) {
        this.sessionid = uuidv4();
    }

    private history: ChatHistory[] = [];
    private sessionid: string

    clearChatHistory() { 
        this.history = [];
    }
    
    submitUserReplyToBOT(query: string, onComplete: ()=>void): Observable<RESULT<string>> {
        let replyFromBot: string = '';
        let encountedError: boolean = false;
        return new Observable<RESULT<string>>((observer)=>{
            this.history = this.dataService.dumpChatHistory(this.history)
            let ended = false;
            const observable = this.dataService.submitUserReply(query, this.sessionid, this.history, ()=> {
                ended = true;
                this.history.push(new ChatHistory(EnumChatUserRoles.User, query));
                if(replyFromBot.trim().length > 0) {
                    this.history.push(new ChatHistory(EnumChatUserRoles.Assistant, replyFromBot));
                    onComplete();
                } else if(!encountedError) {
                    observer.next(RESULT.error(new Error("We were unable to produce a response for you, typically indicating a configuration problem. Please review your settings and attempt the operation once more.")))
                    setTimeout(onComplete, 10);
                } else { 
                    onComplete();
                }
                
                
            })
            observable.pipe(takeWhile(()=> { 
                return !ended;
            })).subscribe({
                next: (result: RESULT<string>) => { 
                    switch(result.isError) { 
                        case true:
                            replyFromBot = '';
                            observer.next(RESULT.error(result.error!));
                            encountedError = true;
                            break;
                        case false: 
                            replyFromBot += result.result || '';
                            observer.next(RESULT.ok(replyFromBot));
                            break;
                    }
                }
            })
        });
        
    }


}