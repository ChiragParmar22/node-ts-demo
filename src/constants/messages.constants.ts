export default {
  WELCOME_MESSAGE: (appName: string, nodeEnv: string) =>
    `Welcome to ${appName} ${nodeEnv} APIs.`,
  ROUTE_NOT_FOUND: 'The requested route does not exist.',
  INTERNAL_SERVER_ERROR: 'Internal server error. Please try again later.',
  SERVER_START_SUCCESS: (port: number, nodeEnv: string) =>
    `Server is running on port ${port} in ${nodeEnv} mode.`,
  SOMETHING_WENT_WRONG: 'Something went wrong.',

  HEALTH_CHECK_SUCCESS: 'All systems operational.',
  HEALTH_CHECK_UNHEALTHY: "Something isn't working as expected.",

  MAINTENANCE_MESSAGE:
    "Our system is temporarily under maintenance. We'll be back soon.",
  DATABASE_CONNECTION_SUCCESS: 'Database connection established successfully.',
  DATABASE_CONNECTION_ERROR: 'Unable to connect to the database.',
  UPDATE_APP_REQUIRED:
    'Please update the app to continue using it without missing any new updates.',
  MISSING_REQUIRED_HEADERS:
    'Request headers must include valid devicetype and versioncode.',
  INVALID_DEVICE_TYPE:
    'Invalid devicetype. Allowed values are iOS and android.',
  INVALID_VERSION_CODE:
    'Please update the app to continue using it without missing any new updates.',

  INVALID_TOKEN:
    'You are not authorized to access the associated web services. Please enter a valid token.',
  TOKEN_EXPIRED:
    'You are not authorized to access the associated web services. It seems the token has expired.',

  SUCCESS: 'Operation Executed Successfully.',
  CREATED: 'Record created successfully.',
  BAD_REQUEST: 'Bad request.',
  UNAUTHORIZED:
    'You are not authorized to access this resource. It seems the token has expired or you are not logged in.',
  FORBIDDEN: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  CONFLICT: 'Resource conflict occurred.',
  VALIDATION_ERROR: 'Validation error.',

  USER_NOT_REGISTERED:
    'This email is not registered with us. Please use correct email address.',
  INCORRECT_PASSWORD: 'Your password is incorrect.',
  EMAIL_ALREADY_EXISTS:
    'This email is already registered with us. Please try another email.',
  PHONE_NUMBER_ALREADY_EXISTS:
    'This phone number is already registered with us. Please use a different number.',
  ACCOUNT_CREATED: 'Your account is registered successfully.',
  SIGNIN_SUCCESSFULLY: 'Sign in successfully.',

  OTP_SEND:
    'Authentication code has been sent successfully. Please check your email and enter the code to proceed.',
  OTP_EXPIRED:
    'OTP has been expired or invalid. Please try again or resend OTP.',
  INVALID_OTP: 'Invalid OTP.',
  OTP_VERIFIED: 'OTP verified successfully.',
  PASSWORD_RESET_SUCCESSFULLY: 'Password reset successfully.',
  PASSWORD_ALREADY_USED:
    'Your new password is same as old password. Please use different password.',
  TOKEN_REFRESHED_SUCCESSFULLY: 'Token refreshed successfully.',

  USER_NOT_FOUND: 'User not found.',
  PROFILE_UPDATED_SUCCESSFULLY: 'Profile updated successfully.',
  PASSWORD_CHANGED_SUCCESSFULLY: 'Password changed successfully.',
  PROFILE_FETCHED_SUCCESSFULLY: 'Profile fetched successfully.',
  ACCOUNT_DELETED_SUCCESSFULLY: 'Account deleted successfully.',
  LOGOUT_SUCCESSFULLY: 'You have been sign out successfully.',

  CONTACT_US_MESSAGE:
    'Thank you for reaching out to us. We will get back to you shortly.',

  NOTIFICATIONS_FETCHED_SUCCESSFULLY: 'Notifications fetched successfully.',
  UNREAD_NOTIFICATION_COUNT_FETCHED_SUCCESSFULLY:
    'Unread notification count fetched successfully.',

  USER_JOINED_ROOM: 'Room joined successfully.',
  USER_LEFT_ROOM: 'Room left successfully.',
  INVALID_USER_ID: 'Invalid user ID provided.',
  ROOM_USER_NOT_FOUND: 'User not found. Cannot join or leave the room.',
};
