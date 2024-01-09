import { Observable } from "rxjs";
import { ChatHistory, ChatResponseStream, StreamChatCacheData, StreamChatMessageData } from "../models/chat-message.model";
import { RESULT } from "../models/result.model";
import { IChatService } from "./interfaces/chat-service.interface";

export class ChatDataService implements IChatService {
    private url: string
    constructor(url: string, public identifier: string, public knowledgeBaseId: string) {
        if (url.endsWith('/')) {
            this.url = `${url}api/v2.0/ai/llm-chat`
        } else {
            this.url = `${url}/api/v2.0/ai/llm-chat`
        }
    }

    private readonly MAX_TOKEN_LIMIT = 2000;

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
                            console.log('--------------')
                            const reader = bodyStream.getReader();
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
                                            }
                                            break;
                                    }
                                } else {
                                    observer.next(<ChatResponseStream>{});
                                    observer.complete();
                                }
                            });

                        } else {
                            observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(null, null, 'We have encountered a problem. Please try again later.') });
                            observer.complete();
                        }
                    } else {
                        return response.json();
                    }
                } else {
                    if (response.statusText && response.statusText.trim().length > 0) {
                        observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(null, null, `We have encountered a problem. Please try again later.\n${response.status}: **${response.statusText}**`) });
                    } else {
                        observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(null, null, `${response.status} - We have encountered a problem. Please try again later.`) });
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

                        observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(null, null, errorMessage) });
                    } else {
                        const result = value['Result'];
                        if (result) {
                            if (result['query_result'] && result['query_result'].trim().length > 0) {
                                observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(result['query_result'].trim(), null, null) });
                            } else {
                                observer.next(<ChatResponseStream>{ message: new StreamChatMessageData('', null, null) });
                            }
                        } else {
                            observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(null, null, 'We have encountered a problem. Please try again later.') });
                        }
                    }

                    observer.complete();
                } else {
                    // we received an stream and its being handled.
                }
            }).catch(reason => {
                observer.next(<ChatResponseStream>{ message: new StreamChatMessageData(null, null, `We have encountered a problem. Please try again later.\n${reason}`) });
                observer.complete();
            })

        })
    }


    private readStream(decoder: TextDecoder, reader: ReadableStreamDefaultReader, callback: (content: { event: string, data: string } | undefined) => void) {

        const processChunk = (chunk: ReadableStreamReadResult<Uint8Array>) => {
            if (chunk.done) {
                // Stream is completed, close the reader and invoke the callback
                reader.releaseLock();
                callback(undefined);
            } else {
                const data = decoder.decode(chunk.value, { stream: true });
                if (data) {
                    const lines = data.trim().split('\n');
                    let eventName: string | undefined = undefined;
                    let message: string | undefined = undefined;
                    for (const line of lines) {
                        if (line.startsWith('event:')) {
                            eventName = line.substring(6).trim();
                        } else if (line.startsWith('data:')) {
                            message = line.substring(5).trim();
                        }
                        if (eventName && message && eventName.length && message.length) {
                            callback({ event: eventName, data: message });
                            eventName = undefined;
                            message = undefined;
                        }
                    }
                }

                // Continue reading recursively
                reader.read().then(processChunk).catch(handleError);
            }
        };

        const handleError = (error: any) => {
            // Handle errors during reading
            // callback({ event: 'message', data: `{ "error": "${error.message}" }` });

            console.log(`We encountered an error while reading stream. Error: ${error.message}`)

            // Close the reader in case of error
            setTimeout(() => {
                callback(undefined);
                reader.releaseLock();
            }, 10);
        };

        // Start the initial read
        reader.read().then(processChunk).catch(handleError);
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