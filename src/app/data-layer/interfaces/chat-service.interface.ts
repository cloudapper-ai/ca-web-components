import { Observable } from "rxjs";
import { ChatHistory, ChatResponseStream } from "src/app/models/chat-message.model";
import { RESULT } from "src/app/models/result.model";

export interface IChatService {
    /**
     * returns AI response for user query.
     * @param query This is whaat customer is looking for 
     * @param sessionId This is an unique id that we use to manage your chat history.
     * @param history the history of customer query and ai response.
     */
    submitUserReply(query: string, sessionId: string, history: ChatHistory[]): Observable<ChatResponseStream>

    /**
     * If the history list becomes large then this function reduces the size of the request.
     * @param history 
     */
    dumpChatHistory(history: ChatHistory[]): ChatHistory[]
}