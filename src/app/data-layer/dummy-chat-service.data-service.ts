import { Observable, concatMap, interval, of, take } from "rxjs";
import { ChatHistory } from "../models/chat-message.model";
import { RESULT } from "../models/result.model";
import { IChatService } from "./interfaces/chat-service.interface";

export class DummyChatDataService implements IChatService {
    submitUserReply(query: string, history: ChatHistory[], onComplete: ()=>void): Observable<RESULT<string>> {
        return new Observable<RESULT<string>>(observer=> {
            setTimeout(()=> {
                const responses: string[] = [ 'You', ' need', ' to', ' contact', ' Cloudapper', ' Sales', ' for', ' this', ' service.', ' You', ' can', ' do', ' so', ' from ', '[here](https://cloudapper.ai/contact-us)']
                interval(50)
                    .pipe(
                        take(responses.length), 
                        concatMap((_value: number, index: number)=> {
                            return of(responses[index]);
                            if(index === responses.length) {
                                setTimeout(()=> { onComplete(); }, 10);
                            }
                        }
                    )).subscribe({ 
                        next: (value)=> {
                            observer.next(RESULT.ok(value));
                        }
                    });
            }, 1000);
        })
    }

    dumpChatHistory(history: ChatHistory[]): ChatHistory[] {
        return history;
    }

}