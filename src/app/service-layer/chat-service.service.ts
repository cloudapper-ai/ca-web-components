import { Observable, takeWhile } from "rxjs";
import { IChatService } from "../data-layer/interfaces/chat-service.interface";
import { ChatHistory, ChatResponseStream, ChatUIActionData, EnumChatUserRoles } from "../models/chat-message.model";
import { RESULT } from "../models/result.model";
import { uuidv4 } from "../helpers/utils";

export class ChatService {
    constructor(private dataService: IChatService) {
        this.sessionid = uuidv4();
    }

    private history: ChatHistory[] = [];
    private sessionid: string

    clearChatHistory() {
        this.history = [];
    }

    submitUserReplyToBOT(query: string, onComplete: () => void): Observable<RESULT<{ message: string; action?: ChatUIActionData }>> {
        let replyFromBot: string = '';
        let encountedError: boolean = false;
        return new Observable<RESULT<{ message: string; action?: ChatUIActionData }>>((observer) => {
            let action: ChatUIActionData | undefined;
            this.history = this.dataService.dumpChatHistory(this.history)
            const observable = this.dataService.submitUserReply(query, this.sessionid, this.history)
            observable.subscribe({
                next: (value: ChatResponseStream) => {
                    if (observer.closed) { return; }
                    if (value.message) {
                        if (value.message.error) {
                            replyFromBot = '';
                            observer.next(RESULT.error(new Error(value.message.content || "We've encounted an unknown problem. Please try agian later.")));
                            encountedError = true;
                            observer.complete();
                        } else if (!encountedError) {
                            if (value.message.content && value.message.content.length > 0) {
                                replyFromBot += value.message.content
                                observer.next(RESULT.ok({ message: replyFromBot, action: action }));
                            } else {
                                replyFromBot += ''
                                observer.next(RESULT.ok({ message: replyFromBot, action: action }));
                            }
                        }
                    } else if (value.uiaction && value.uiaction && value.uiaction.length) {
                        action = value.uiaction[0];
                        observer.next(RESULT.ok({ message: replyFromBot, action: action }));
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