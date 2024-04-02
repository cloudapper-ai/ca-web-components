import { Observable } from "rxjs";
import { ChatHistory, ChatResponseStream, StreamChatActionData, StreamChatCacheData, StreamChatMessageData } from "../models/chat-message.model";
import { IChatService } from "./interfaces/chat-service.interface";
import { QueueClass, QueueManager } from "../helpers/queue.helper";
import { IsNullOrUndefinedOrEmptyString } from "../helpers/helper-functions.helper";

export class ChatDataService implements IChatService {
    private url: string
    constructor(url: string, public identifier: string, public knowledgeBaseId: string) {
        if (url.endsWith('/')) {
            this.url = `${url}api/v2.0/ai/llm-chat`
        } else {
            this.url = `${url}/api/v2.0/ai/llm-chat`
        }
    }

    submitUserReply(query: string, sessionId: string, history: ChatHistory[]): Observable<ChatResponseStream> {
        return new Observable<ChatResponseStream>(observer => {
            let request = {}
            if (this.knowledgeBaseId.length > 0) {
                request = {
                    group_ids: [this.knowledgeBaseId],
                    similarity_top_k: 4,
                    query: query,
                    chat_history: history,
                    system_context: 'You are an AI Assistant made by CloudApper AI.'
                };
            } else {
                request = {
                    similarity_top_k: 4,
                    query: query,
                    chat_history: history,
                    system_context: 'You are an AI Assistant made by CloudApper AI.'
                };
            }

            fetch(this.url, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'X-Ca-Identifier': this.identifier,
                    'X-Ca-Stream-Response': 'true',
                    'X-Ca-Chat-Session-Id': sessionId
                },
                body: JSON.stringify(request)
            }).then(response => {
                if (response.ok) {
                    if (response.headers.get('Content-Type') === 'text/event-stream') {
                        const decoder = new TextDecoder('utf-8');
                        const bodyStream = response.body;
                        if (bodyStream) {
                            const reader = bodyStream.getReader();
                            let receivedKnownElements: boolean = false;
                            this.readStream(decoder, reader, (content) => {
                                if (observer.closed) { return; }
                                if (content) {
                                    switch (content.event) {
                                        case 'message':
                                        case 'error':
                                            {
                                                // this contains the message we want to show to the user.
                                                const data = this.parseMessageContent(content.data);
                                                if (data) {
                                                    observer.next(<ChatResponseStream>{
                                                        message: data
                                                    });
                                                } else {
                                                    observer.next(<ChatResponseStream>{
                                                        message: new StreamChatMessageData(null, null, 'We have encountered a problem when we were parsing response.')
                                                    });

                                                    observer.complete();
                                                }
                                                receivedKnownElements = true;
                                            }
                                            break;
                                        case 'data':
                                            {
                                                const cache = this.parseDataContent(content.data);
                                                if (cache) {
                                                    observer.next(<ChatResponseStream>{
                                                        cache: cache
                                                    });
                                                }
                                                receivedKnownElements = true;
                                            }
                                            break;
                                        case 'uiaction':
                                            {
                                                const data = this.parseUIActionContent(content.data);
                                                if (data) {
                                                    observer.next(<ChatResponseStream>{
                                                        uiaction: data
                                                    });
                                                }
                                                receivedKnownElements = true;
                                            }

                                            break;
                                    }
                                } else {
                                    if (!receivedKnownElements) {
                                        observer.next(<ChatResponseStream>{
                                            message: new StreamChatMessageData("We didn't receive a response that we can work with.", null, {})
                                        });
                                    } else {
                                        observer.next(<ChatResponseStream>{});
                                    }
                                    observer.complete();
                                }
                            });

                        } else {
                            observer.next(<ChatResponseStream>{ message: new StreamChatMessageData('We have encountered a problem. Please try again later.', null, {}) });
                            observer.complete();
                        }
                    } else {
                        return response.json();
                    }
                } else {
                    if (response.statusText && response.statusText.trim().length > 0) {
                        observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(`We have encountered a problem. Please try again later.\n${response.status}: **${response.statusText}**`, null, {}) });
                    } else {
                        observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(`${response.status} - We have encountered a problem. Please try again later.`, null, {}) });
                    }

                    observer.complete();

                }
                return undefined;
            }).then(value => {
                if (value) {
                    if (value['ResponseCode'] && value['ResponseCode'] !== 200) {
                        const code = value['ResponseCode'];
                        let errorMessage: string = '';
                        if (value['Message'] && value['Message'].trim().length > 0) {
                            const message = value['Message'].trim();
                            errorMessage = `We have encountered a problem. Please try again later.\n${code}-**${message}**`;
                        } else {
                            errorMessage = `${code} - We have encountered a problem. Please try again later.`;
                        }

                        observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(errorMessage, null, {}) });
                    } else {
                        const result = value['Result'];
                        if (result) {
                            if (result['query_result'] && result['query_result'].trim().length > 0) {
                                observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(result['query_result'].trim(), null, null) });
                            } else {
                                observer.next(<ChatResponseStream>{ message: new StreamChatMessageData('', null, null) });
                            }
                        } else {
                            observer.next(<ChatResponseStream>{ message: new StreamChatMessageData('We have encountered a problem. Please try again later.', null, {}) });
                        }
                    }

                    observer.complete();
                } else {
                    // we received an stream and its being handled.
                }
            }).catch(reason => {
                observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(`We have encountered a problem. Please try again later.\n${reason}`, null, {}) });
                observer.complete();
            })

        })
    }

    private readStream(decoder: TextDecoder, reader: ReadableStreamDefaultReader, callback: (content: { event: string, data: string } | undefined) => void) {
        let ended = false;
        const queueManager = new QueueManager<Uint8Array>();
        queueManager.onQueueEmpty.subscribe(() => {
            if (ended) {
                callback(undefined);
            }
        });

        let eventName: string | undefined = undefined;
        let message: string | undefined = undefined;

        const notify = () => {
            if (eventName && message && eventName.length && message.length && message.endsWith("}")) {
                // console.log('Notifying')
                callback({ event: eventName, data: message });
                eventName = undefined;
                message = undefined;
            }
        }

        const processBuffer: (buffer: Uint8Array) => Promise<void> = (buffer) => {
            return new Promise(resolve => {
                // console.log('===BlockStart===')
                const data = decoder.decode(buffer, { stream: true });
                if (data) {
                    const lines = data.split('\n').filter(x => !IsNullOrUndefinedOrEmptyString(x));

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        // console.log('Line: ' + line);
                        if (line.startsWith('event:')) {
                            notify();
                            eventName = line.substring(6).trim();
                        } else if (line.startsWith('data:')) {
                            message = line.substring(5);
                        } else {
                            message += line;
                        }
                    }

                    notify();
                }
                // console.log('===BlockEnd===')
                resolve();
            })
        }

        const handleError = (error: any) => {
            // Handle errors during reading
            // callback({ event: 'message', data: `{ "error": "${error.message}" }` });

            callback({
                event: 'message', data: JSON.stringify({
                    content: error.message,
                    finish_reason: null,
                    error: error
                })
            })
            console.error(`We encountered an error while reading stream. Error: ${error.message}`)

            // Close the reader in case of error
            setTimeout(() => {
                callback(undefined);
                reader.releaseLock();
            }, 10);
        };

        const processChunk = (chunk: ReadableStreamReadResult<Uint8Array>, readAgain: () => void) => {
            if (chunk.done) {
                // Stream is completed, close the reader and invoke the callback
                reader.releaseLock();
                ended = true;
                queueManager.execute();
            } else {
                queueManager.addInQueue(new QueueClass(processBuffer, chunk.value));
                queueManager.execute();
                // continuously read buffer
                readAgain();
            }
        }

        const readFn = () => {
            reader.read().then((chunk) => {
                processChunk(chunk, () => { readFn(); })
            }).catch(handleError)
        }

        // initiate reading buffer
        readFn();
    }

    private parseMessageContent(string: string): StreamChatMessageData | null {
        const data: StreamChatMessageData = JSON.parse(string)
        if (data) { return data }
        else { return null; }
    }

    private parseDataContent(string: string): StreamChatCacheData | null {
        const data: StreamChatCacheData = JSON.parse(string)
        if (data) { return data }
        else { return null; }
    }

    private parseUIActionContent(string: string): StreamChatActionData | null {
        try {
            const data: StreamChatActionData = JSON.parse(string)
            if (data) { return data }
            else { return null; }
        } catch (_error) {
            return null;
        }

    }

    private readonly MAX_TOKEN_LIMIT = 2000;
    dumpChatHistory(history: ChatHistory[]): ChatHistory[] {
        return history;
        // const newHistory: ChatHistory[] = [];
        // let totalLength: number = 0
        // for(let j = history.length -1; j>=0; j--) {
        //     const length = history[j].content.length;
        //     totalLength += length;
        //     if(totalLength > this.MAX_TOKEN_LIMIT) { break; }
        //     newHistory.push(history[j]);
        // }
        // return newHistory.reverse();
    }
}

class ChatStreamResponse {
    constructor(public content: string | null, public finish_reason: string | null, public error: string | null) { }
}