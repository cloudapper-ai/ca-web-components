import { Observable, takeWhile } from "rxjs";
import { IChatService } from "../data-layer/interfaces/chat-service.interface";
import { ChatHistory, EnumChatUserRoles } from "../models/chat-message.model";
import { RESULT } from "../models/result.model";

export class ChatService {
    constructor(private dataService: IChatService) {}

    private history: ChatHistory[] = [];

    clearChatHistory() { 
        this.history = [];
    }
    
    submitUserReplyToBOT(query: string, onComplete: ()=>void): Observable<RESULT<string>> {
        let replyFromBot: string = '';
        let encountedError: boolean = false;
        return new Observable<RESULT<string>>((observer)=>{
            this.history = this.dataService.dumpChatHistory(this.history)
            let ended = false;
            const observable = this.dataService.submitUserReply(query, this.history, ()=> {
                ended = true;
                this.history.push(new ChatHistory(EnumChatUserRoles.User, query));
                this.history.push(new ChatHistory(EnumChatUserRoles.Assistant, replyFromBot));
                onComplete();
            })
            observable.pipe(takeWhile(()=> { 
                return !ended;
            })).subscribe({
                next: (result: RESULT<string>) => { 
                    switch(result.isError) { 
                        case true:
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