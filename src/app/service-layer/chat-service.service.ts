import { Observable, takeWhile } from "rxjs";
import { IChatService } from "../data-layer/interfaces/chat-service.interface";
import { ChatHistory, ChatResponseStream, EnumChatUserRoles } from "../models/chat-message.model";
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

    submitUserReplyToBOT(query: string, onComplete: () => void): Observable<RESULT<string>> {
        let replyFromBot: string = '';
        let encountedError: boolean = false;
        return new Observable<RESULT<string>>((observer) => {
            this.history = this.dataService.dumpChatHistory(this.history)
            const observable = this.dataService.submitUserReply(query, this.sessionid, this.history)
            observable.subscribe({
                next: (value: ChatResponseStream) => {
                    if (observer.closed) { return; }
                    if (value.message) {
                        if (value.message.error) {
                            replyFromBot = '';
                            observer.next(RESULT.error(new Error(value.message.error)));
                            encountedError = true;
                            observer.complete();
                        } else if (!encountedError) {
                            if (value.message.content && value.message.content.length > 0) {
                                replyFromBot += value.message.content
                                observer.next(RESULT.ok(replyFromBot));
                            } else {
                                replyFromBot += ''
                                observer.next(RESULT.ok(replyFromBot));
                            }
                        }
                    }
                },
                complete: () => {
                    if (!encountedError) {
                        this.history.push(...[
                            new ChatHistory(EnumChatUserRoles.User, query),
                            new ChatHistory(EnumChatUserRoles.Assistant, replyFromBot),
                        ])
                    }
                    observer.complete(); onComplete();
                }

            })
        });

    }


}