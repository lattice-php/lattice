import { ChatFrame, ChatMessage, ChatTransport, UseChatReturn } from '../types';
export type UseChatOptions = {
    endpoint: string;
    transport?: ChatTransport;
    initialMessages?: ChatMessage[];
    generateId?: () => string;
};
/**
 * Pure reducer for a single streamed frame: a `text` frame appends to the open
 * assistant text part (opening one if the last part is not text); a `part` frame
 * pushes a complete part, which closes the open text part. Operates immutably on
 * the last assistant message.
 */
export declare function foldFrame(messages: ChatMessage[], frame: ChatFrame): ChatMessage[];
export declare function useChat({ endpoint, transport, initialMessages, generateId, }: UseChatOptions): UseChatReturn;
