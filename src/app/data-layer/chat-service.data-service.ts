import { Observable } from "rxjs";
import { ChatHistory } from "../models/chat-message.model";
import { RESULT } from "../models/result.model";
import { IChatService } from "./interfaces/chat-service.interface";

export class ChatDataService implements IChatService {
    private url: string
    constructor(url: string, public identifier: string, public knowledgeBaseId: string) {
        if(url.endsWith('/')) { 
            this.url = `${url}api/v2.0/ai/llm-chat`
        } else { 
            this.url = `${url}/api/v2.0/ai/llm-chat`
        }
    }

    private readonly MAX_TOKEN_LIMIT = 2000;
    private isStreaming: boolean = false;

    submitUserReply(query: string, history: ChatHistory[], onComplete: () => void): Observable<RESULT<string>> {
        return new Observable<RESULT<string>>(observer=> { 
            if(this.isStreaming) { return; }
            this.isStreaming = true;
            const request = { 
                group_ids: [ this.knowledgeBaseId ],
                similarity_top_k: 4, 
                query: query, 
                chat_history: history,
                system_context: 'You are an AI Assistant made by CloudApper AI.'
            };
            fetch(this.url, { 
                method: 'post',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'X-Ca-Identifier': this.identifier,
                    'X-Ca-Stream-Response': 'true'
                },
                body: JSON.stringify(request)
            }).then(response=> { 
                if(response.ok) {
                    if(response.headers.get('Content-Type')==='text/event-stream') {
                        const bodyStream = response.body;
                        if(bodyStream) {
                            // Create a TextDecoder to decode the response data (adjust encoding as needed)
                            const decoder = new TextDecoder('utf-8');
                                            
                            // Process the response data as chunks become available
                            const reader = bodyStream.getReader();
                            this.readStream(decoder, reader, ()=> { 
                                this.isStreaming = false;   
                                setTimeout(onComplete, 10);
                            }, (result)=> { 
                                observer.next(result);
                            })
                            
                        } else { 
                            observer.next(RESULT.error(new Error('We have encountered a problem. Please try again later.')));
                            this.isStreaming = false;
                            setTimeout(onComplete, 10);
                        }
                    } else { 
                        return response.json()
                    }
                    
                } else { 
                    if(response.statusText && response.statusText.trim().length > 0) {
                        observer.next(RESULT.error(new Error(`We have encountered a problem. Please try again later.\n${response.status}: **${response.statusText}**`)));
                    } else { 
                        observer.next(RESULT.error(new Error(`${response.status} - We have encountered a problem. Please try again later.`)));
                    }
                    this.isStreaming = false;
                    setTimeout(onComplete, 10);
                }
                
                return undefined;
                
            }).then(value=>{ 
                if(value && value['ResponseCode'] && value['ResponseCode'] !== 200) { 
                    let code = value['ResponseCode'];
                    let errorMessage: string = '';
                    if (value['Message'] && value['Message'].trim().length > 0) {
                        let message = value['Message'].trim();
                        errorMessage = `We have encountered a problem. Please try again later.\n${code}-**${message}**`;
                    } else { 
                        errorMessage = `${code} - We have encountered a problem. Please try again later.`;
                    }

                    observer.next(RESULT.error(new Error(
                        errorMessage
                    )));

                    this.isStreaming = false;
                    setTimeout(onComplete, 10);
                }
            }).catch(reason=> {
                observer.next(RESULT.error(new Error(`We have encountered a problem. Please try again later.\n${reason}`)));
                this.isStreaming = false;
                setTimeout(onComplete, 10);
            })

        })
    }

    private readStream(
        decoder: TextDecoder, 
        reader: ReadableStreamDefaultReader, 
        completion: ()=>void, 
        valueCallback: (data: RESULT<string>)=>void) {
        
        reader.read().then((chunk)=> {
            if(chunk.done) { completion(); return; }
            const data = decoder.decode(chunk.value, { stream: true });
            let error: boolean = false;
            let complete: boolean = false;
            if(data) {
                let foundContent: boolean = false
                const lines = data.split('\n');
                for(const line of lines) { 
                    if(line.startsWith('data:')) { 
                        foundContent = true;
                        const stream: ChatStreamResponse = JSON.parse(line.substring(5).trim());
                        if(stream) {
                            if(stream.error) { 
                                error = true;
                                break;
                            } else if (stream.finish_reason === 'done') {
                                complete = true;
                                break;
                            } else if(stream.content) { 
                                valueCallback(RESULT.ok(stream.content))
                            } else { 
                                valueCallback(RESULT.ok(''))
                            }
                        } else { 
                            error = true;
                            break;
                        }
                    }
                }

                if(!foundContent) { valueCallback(RESULT.ok('')); }
            } else {
                valueCallback(RESULT.ok(''));
            }
            
            if(!error) {
                if(complete) {
                    completion();
                } else {
                    this.readStream(decoder, reader, completion, valueCallback);
                }
            } else {
                valueCallback(RESULT.error(new Error('We have encountered a problem. Please try again later.')));
                completion();
            }

        }).catch((reason)=> { 
            console.log('We encounterd an error.' + reason);
            valueCallback(RESULT.error(new Error('We have encountered a problem. Please try again later.')));
            completion();
        });
    }

    dumpChatHistory(history: ChatHistory[]): ChatHistory[] {
        const newHistory: ChatHistory[] = [];
        let totalLength: number = 0
        for(let j = history.length -1; j>=0; j--) {
            const length = history[j].content.length;
            totalLength += length;
            if(totalLength > this.MAX_TOKEN_LIMIT) { break; }
            newHistory.push(history[j]);
        }
        return newHistory.reverse();
    }
}

class ChatStreamResponse {
    constructor(public content: string|null, public finish_reason: string|null, public error: string|null) {}
}