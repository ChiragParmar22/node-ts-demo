import { NextFunction, Request, Response } from 'express';

import { DeviceType } from '../constants/key.constants';
import messagesConstants from '../constants/messages.constants';
import AppVersionsRepository from '../repositories/appVersions.repository';
import ApiResponse from '../utils/apiResponse';

const getHeaderValue = (header: string | string[] | undefined): string => {
  if (Array.isArray(header)) {
    return header[0]?.trim() ?? '';
  }

  return header?.trim() ?? '';
};

const bypassedApis = ['/api/contactUs'];

export default async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const isBypassed = bypassedApis.some((api) => {
      return request.path === api || request.path.startsWith(`${api}/`);
    });

    if (isBypassed) {
      next();
      return;
    }

    const deviceTypeHeader = getHeaderValue(request.headers.devicetype);
    const versionCodeHeader = getHeaderValue(request.headers.versioncode);

    if (deviceTypeHeader === 'web') {
      next();
      return;
    }

    if (!deviceTypeHeader || !versionCodeHeader) {
      const apiResponse = ApiResponse.unProcessEntity(
        messagesConstants.MISSING_REQUIRED_HEADERS
      );
      return response.status(apiResponse.statusCode).json(apiResponse);
    }

    const isValidDeviceType = Object.values(DeviceType).includes(
      deviceTypeHeader as DeviceType
    );

    if (!isValidDeviceType) {
      const apiResponse = ApiResponse.unProcessEntity(
        messagesConstants.INVALID_DEVICE_TYPE
      );
      return response.status(apiResponse.statusCode).json(apiResponse);
    }

    const appVersion =
      await AppVersionsRepository.findByDeviceTypeAndVersionCode(
        deviceTypeHeader as DeviceType,
        versionCodeHeader
      );

    if (!appVersion) {
      const apiResponse = ApiResponse.appUpdate(
        messagesConstants.INVALID_VERSION_CODE
      );
      return response.status(apiResponse.statusCode).json(apiResponse);
    }

    next();
  } catch (error) {
    const apiResponse = ApiResponse.internalError(error as string);
    return response.status(apiResponse.statusCode).json(apiResponse);
  }
};
