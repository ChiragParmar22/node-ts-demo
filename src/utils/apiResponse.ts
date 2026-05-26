import { StatusCodes } from 'http-status-codes';

import messagesConstants from '../constants/messages.constants';

/**
 * API Response Handler Class
 * Provides static methods for sending standardized API responses
 */
export default class ApiResponse {
  statusCode: number;
  isSuccess: boolean;
  data: unknown;
  message: string | unknown;

  constructor(
    isSuccess: boolean,
    statusCode: number,
    message: unknown,
    data: unknown = null
  ) {
    this.statusCode = statusCode;
    this.isSuccess = isSuccess;
    const newMessage: string =
      typeof message === 'string'
        ? message
        : message && typeof message === 'object' && 'message' in message
          ? String((message as { message: string }).message)
          : String(message ?? '');

    const resMessage =
      messagesConstants?.[newMessage as keyof typeof messagesConstants] ??
      (newMessage as string);

    this.message = resMessage;
    this.data = data;
  }

  /**
   * Success response
   * @param {*} data - Response data
   * @param {string} message - Success message (default: "Operation Executed Successfully.")
   * @param {number} statusCode - HTTP status code (default: 200)
   * @returns {ApiResponse}
   */
  static success(
    data: unknown = null,
    message: string = messagesConstants.SUCCESS,
    statusCode: number = StatusCodes.OK
  ) {
    return new ApiResponse(true, statusCode, message, data);
  }

  /**
   * Created response
   * @param {*} data - Response data
   * @param {string} message - Success message (default: "Record created successfully.")
   * @param {number} statusCode - HTTP status code (default: 201)
   * @returns {ApiResponse}
   */
  static created(
    data: unknown,
    message: string = messagesConstants.CREATED,
    statusCode: number = StatusCodes.CREATED
  ) {
    return new ApiResponse(true, statusCode, message, data);
  }

  /**
   * Bad request response
   * @param {string} message - Error message (default: "Bad request.")
   * @param {*} data - Additional error data
   * @returns {ApiResponse}
   */
  static badRequest(message = messagesConstants.BAD_REQUEST, data = null) {
    return new ApiResponse(false, StatusCodes.BAD_REQUEST, message, data);
  }

  /**
   * Unauthorized response
   * @param {string} message - Error message (default: "You are not authorized to access this resource. It seems the token has expired or you are not logged in.")
   * @param {*} data - Additional error data
   * @returns {ApiResponse}
   */
  static unauthorized(message = messagesConstants.UNAUTHORIZED, data = null) {
    return new ApiResponse(false, StatusCodes.UNAUTHORIZED, message, data);
  }

  /**
   * Forbidden response
   * @param {string} message - Error message (default: "You are not authorized to perform this action.")
   * @param {*} data - Additional error data
   * @returns {ApiResponse}
   */
  static forbidden(message = messagesConstants.FORBIDDEN, data = null) {
    return new ApiResponse(false, StatusCodes.FORBIDDEN, message, data);
  }

  /**
   * Not found response
   * @param {string} message - Error message (default: "Resource not found.")
   * @param {*} data - Additional error data
   * @returns {ApiResponse}
   */
  static notFound(message = messagesConstants.NOT_FOUND, data = null) {
    return new ApiResponse(false, StatusCodes.NOT_FOUND, message, data);
  }

  /**
   * Conflict response
   * @param {string} message - Error message (default: "Resource conflict occurred.")
   * @param {*} data - Additional error data
   * @returns {ApiResponse}
   */
  static conflict(message = messagesConstants.CONFLICT, data = null) {
    return new ApiResponse(false, StatusCodes.CONFLICT, message, data);
  }

  /**
   * Not found response
   * @param {string} message - Error message (default: "This user is deleted")
   * @param {*} data - Additional error data
   * @returns {ApiResponse}
   */
  static userDeleted(
    message: string = 'This user is deleted',
    data: unknown = null
  ) {
    return new ApiResponse(false, StatusCodes.GONE, message, data);
  }

  /**
   * Validation error response
   * @param {string} message - Error message (default: "Validation error.")
   * @param {*} data - Additional error data
   * @returns {ApiResponse}
   */
  static unProcessEntity(
    message = messagesConstants.VALIDATION_ERROR,
    data = null
  ) {
    return new ApiResponse(
      false,
      StatusCodes.UNPROCESSABLE_ENTITY,
      message,
      data
    );
  }

  /**
   * Update App response
   * @param {string} message - Error message (default: "Please update the app to continue using it without missing any new updates.")
   * @param {*} data - Additional error data
   * @returns {ApiResponse}
   */
  static appUpdate(
    message = messagesConstants.UPDATE_APP_REQUIRED,
    data = null
  ) {
    return new ApiResponse(false, StatusCodes.UPGRADE_REQUIRED, message, data);
  }

  /**
   * Internal server error response
   * @param {string} message - Error message (default: "Internal server error. Please try again later.")
   * @param {*} data - Additional error data
   * @returns {ApiResponse}
   */
  static internalError(
    message = messagesConstants.INTERNAL_SERVER_ERROR,
    data = null
  ) {
    return new ApiResponse(
      false,
      StatusCodes.INTERNAL_SERVER_ERROR,
      message,
      data
    );
  }

  /**
   * Send service unavailable response (503)
   * @param res - Express response object
   * @param message - Error message
   * @param data - Optional error details
   */
  static serviceUnavailable(
    message: string = messagesConstants.MAINTENANCE_MESSAGE,
    data = null
  ) {
    return new ApiResponse(
      false,
      StatusCodes.SERVICE_UNAVAILABLE,
      message,
      data
    );
  }

  /**
   * Temporary redirection - repurchase plan
   * @param {string} message - Error message (default: Repurchase plan)
   * @param {*} data - Additional error data
   * @returns {ApiResponse}
   */
  static temporaryRedirection(message = 'Repurchase plan', data = null) {
    return new ApiResponse(false, 327, message, data);
  }

  /**
   * Unauthorized - refresh token response
   * @param {string} message - Error message (default: "refresh token access")
   * @param {*} data - Additional error data
   * @returns {ApiResponse}
   */
  static unauthorizedRefresh(message = 'Token Expired', data = null) {
    return new ApiResponse(false, 433, message, data);
  }
}
