import { RemoteAccess } from "@lattice-php/core/api";
import { ChatFrame, ChatTransportRequest } from "../types";
export declare const ndjsonChatTransport: (
  request: ChatTransportRequest,
) => AsyncGenerator<ChatFrame>;
export declare function createRemoteNdjsonChatTransport(
  remote: RemoteAccess,
): (request: ChatTransportRequest) => AsyncGenerator<ChatFrame>;
