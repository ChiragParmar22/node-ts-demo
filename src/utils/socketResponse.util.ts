import type { SocketEmitEventName } from '../constants/key.constants';

import ApiResponse from './apiResponse';

/**
 * Shape returned to clients via Socket.IO ack callbacks or server emits.
 * Mirrors {@link ApiResponse} fields for parity with REST responses.
 */
export type SocketAckPayload = {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: unknown;
};

const messageFromApi = (api: ApiResponse): string => {
  const m = api.message;
  return typeof m === 'string' ? m : String(m ?? '');
};

export const toSocketAck = (apiResponse: ApiResponse): SocketAckPayload => {
  return {
    isSuccess: apiResponse.isSuccess,
    statusCode: apiResponse.statusCode,
    message: messageFromApi(apiResponse),
    data: apiResponse.data,
  };
};

/**
 * Single entry point for all server -> client Socket.IO emits.
 * Always sends {@link SocketAckPayload} so wire format matches REST {@link ApiResponse}.
 */
export const emitSocketResponse = (
  emitter: {
    emit: (event: SocketEmitEventName, payload: SocketAckPayload) => unknown;
  },
  event: SocketEmitEventName,
  apiResponse: ApiResponse
): unknown => emitter.emit(event, toSocketAck(apiResponse));
