export class ApiResult<T> {
    private constructor(
        public value?: T,
        public serverError?: ServerError,
        public networkError?: NetworkError,
        public localError?: LocalError) { }

    static ok<T>(value: T | undefined): ApiResult<T> {
        return new ApiResult(value);
    }

    static serverError<T>(error: ServerError): ApiResult<T> {
        return new ApiResult<T>(undefined, error);
    }

    static networkError<T>(error: NetworkError): ApiResult<T> {
        return new ApiResult<T>(undefined, undefined, error);
    }

    static localError<T>(error: LocalError): ApiResult<T> {
        return new ApiResult<T>(undefined, undefined, undefined, error);
    }

    getError(): IErrorMessage | null {
        if (this.serverError) { return this.serverError; }
        else if (this.networkError) { return this.networkError; }
        else if (this.localError) { return this.localError; }
        return null;
    }
}


export interface IErrorMessage {

    getErrorMessage(): string
}

interface IApiError {
    code: number
}
export class ServerError implements IApiError, IErrorMessage {
    errorType: ServerErrorCodes = ServerErrorCodes.UnKnown
    constructor(public code: number, public message?: string) {
        switch (code) {
            case 1000:
            case 4000:
                this.errorType = ServerErrorCodes.EmailAlreadyTaken;
                break
            case 1008:
                this.errorType = ServerErrorCodes.UnableToClearUserRecord
                break
            case 1001:
                this.errorType = ServerErrorCodes.UnableToStoreUserRecord
                break
            case 404:
                this.errorType = ServerErrorCodes.ResourceUnavailable
                break
            case 409:
                this.errorType = ServerErrorCodes.UniqueDataViolation
                break
            case 401:
                this.errorType = ServerErrorCodes.Unauthorized;
                break
            case 400:
                this.errorType = ServerErrorCodes.InvalidRequestFormat
                break
            case 413:
                this.errorType = ServerErrorCodes.PayloadTooLargeError
                break
            case 415:
                this.errorType = ServerErrorCodes.UnsupportedFileFormatError
                break
            case 500:
                this.errorType = ServerErrorCodes.InternalServerError
                break
            case 1009:
                this.errorType = ServerErrorCodes.UserCountLimitReached
                break
            case 2000:
                this.errorType = ServerErrorCodes.QueueLimitReached;
                break
            case 2001:
                this.errorType = ServerErrorCodes.ActiveQueueItemFound;
                break
            case 297:
                this.errorType = ServerErrorCodes.CompanyNameIsAlreadyTaken
                break
            case 502:
                this.errorType = ServerErrorCodes.ServiceIsUnavailable
                break
            case 2007:
                this.errorType = ServerErrorCodes.UpdatedVersionOfRecordAvailable
                break
            case 4003:
                this.errorType = ServerErrorCodes.DeviceIdisAlreadyRegistered
                break
            case 5004:
                this.errorType = ServerErrorCodes.SubscriptionHasExpired
                break
            case 2011:
                this.errorType = ServerErrorCodes.NoLayoutMapAvailable
                break
            case 3002:
                this.errorType = ServerErrorCodes.RecordWasSavedAndDeleted;
                break
            case 2013:
                this.errorType = ServerErrorCodes.OneToOneRelationViolation;
                break;
        }
    }

    getErrorMessage(): string {
        switch (this.code) {
            case 1000:
            case 4000:
                return "This email address is already taken."
            case 1008:
                return "We were unable to remove this user record";
            case 1001:
                return "We were unable to save this user record."
            case 401:
                return "You are not authorized for this operation."
            case 404:
                return "The data you are looking for isn't available."
            case 413:
                return "Exceeds maximum file size."
            case 415:
                return "Unsupported file format."
            case 409:
                return "We encountered problem with unique property validation."
            case 400:
                return "The request format isn't in the correct format."
            case 500:
                return "Sorry we encountered an internal server error. Please try again later."
            case 1009:
                return "You have reached the limit of user count"
            case 2000:
                return "You have reached the limit of item in the queue"
            case 2001:
                return "There is already an active item in the queue"
            case 297:
                return "This company name is already taken"
            case 404:
                return "The data you requested is not available."
            case 502:
                return "Service is unavailable, please try again later"
            case 2007:
                return "There is an updated version of this record"
            case 4001:
                return "User found but not attached yet."
            case 4003:
                return "Device is already registered"
            case 5004:
                return "Subscription expired. Please update your subscription."
            case 2000:
                return "Queue limit reached. Please try again later."
            case 2001:
                return "This queue is not available."
            case 2011:
                return "There is no linkable layout map data."
            case 3002:
                return "Record saved successfully"
            case 2013:
                return "Parent record already has a child."
            case 3002:
                return "Record was saved sucessfully, and then removed after that."
            default:
                if (this.message && this.message.trim() && this.message.trim().length > 0) {
                    return this.message;
                } else {
                    if (this.code === 0) {
                        return 'We encounted an internal problem. Please try again later.';
                    }
                    return `${this.code} - We encounted an internal problem. Please try again later.`;
                }
        }
    }
}

export enum ServerErrorCodes {
    UnKnown = -1,
    EmailAlreadyTaken = 1000,
    UnableToClearUserRecord = 1008,
    UnableToStoreUserRecord = 1001,
    Unauthorized = 401,
    ResourceUnavailable = 404,
    UniqueDataViolation = 409,
    InvalidRequestFormat = 400,
    PayloadTooLargeError = 413,
    UnsupportedFileFormatError = 415,
    InternalServerError = 500,
    UserCountLimitReached = 1009,
    QueueLimitReached = 2000,
    ActiveQueueItemFound = 2001,
    CompanyNameIsAlreadyTaken = 297,

    ServiceIsUnavailable = 502,
    UpdatedVersionOfRecordAvailable = 2007,

    EmailAlreadyTaken2 = 4000,
    UserFoundButNotAttachedYet = 4001,
    EmailIsNotRegistered = 4002,
    // FailedToRemoveDefaultUser = 4003,
    // UserFoundButNotAttachedYet2 = 4000,
    // UserFoundButNotAttachedYet = 4001,
    DeviceIdisAlreadyRegistered = 4003,
    SubscriptionHasExpired = 5004,

    NoLayoutMapAvailable = 2011,
    OneToOneRelationViolation = 2013,
    RecordWasSavedAndDeleted = 3002
}

export class NetworkError implements IApiError, IErrorMessage {
    errorType: NetworkErrorCodes = NetworkErrorCodes.Unknown
    constructor(public code: number, public message?: string) {
        switch (code) {
            case 0: this.errorType = NetworkErrorCodes.CORS_ERROR; break;
            case 404: this.errorType = NetworkErrorCodes.ResourceUnavailable; break;
            case 401: this.errorType = NetworkErrorCodes.Unauthorized; break;
            case 500: this.errorType = NetworkErrorCodes.InternalServerError; break;
            case 502: this.errorType = NetworkErrorCodes.ServiceIsUnavailable; break;
        }
    }

    getErrorMessage(): string {
        switch (this.code) {
            case 0: return "Oops! It seems there was an issue reaching the server. Our team is actively working to resolve this problem. In the meantime, if you need immediate assistance, please don't hesitate to get in touch with our support team. Thank you for your patience!";
            case 404: return "The requested resource is not available."
            case 401: return "You are not authorized for this"
            case 500: return "We have encountered an internal problem. Please try again later."
            case 502: return "The service is temporarily unavailable. Please try again later."
            default:
                if (this.message && this.message.trim() && this.message.trim().length > 0) {
                    return this.message;
                } else {
                    return `${this.code} - There is something wrong with the network. Please try again later.`;
                }
        }
    }
}


export enum NetworkErrorCodes {
    CORS_ERROR = 0,
    ResourceUnavailable = 404,
    Unauthorized = 401,
    InternalServerError = 500,
    ServiceIsUnavailable = 502,
    Unknown = -1
}

export class AccountServerResponse<T> {
    constructor(public success: boolean, public responseCode: number, public result?: T | null, public message?: string | null) { }

    toApiResult(): ApiResult<T> {
        if (this.success) {
            if (this.result) {
                return ApiResult.ok(this.result)
            } else {
                return ApiResult.serverError(new ServerError(500))
            }
        } else {
            return ApiResult.serverError(new ServerError(this.responseCode, this.message ?? undefined))
        }
    }

    static from<T>(object: {
        success: boolean,
        responseCode: number,
        result?: T | null,
        message?: string | null
    }): AccountServerResponse<T> {
        return new AccountServerResponse<T>(object.success, object.responseCode, object.result, object.message)
    }
}

export class ApiServerResponse<T> {
    constructor(public Success: boolean, public ResponseCode: number, public Result?: T | null, public Message?: string | null) {
    }

    toApiResult(): ApiResult<T> {
        if (this.Success) {
            return ApiResult.ok(this.Result ?? undefined)
        } else {
            return ApiResult.serverError(new ServerError(this.ResponseCode, this.Message ?? undefined))
        }
    }

    static from<T>(object: {
        Success: boolean,
        ResponseCode: number,
        Result?: T | null,
        Message?: string | null
    }): ApiServerResponse<T> {
        return new ApiServerResponse<T>(object.Success, object.ResponseCode, object.Result, object.Message)
    }
}

export class LocalError implements IErrorMessage {

    private constructor(private name: string) { }

    getErrorMessage(): string {
        switch (this.name) {
            case 'NoUserDataIsSet': return "User information not found. Please try again after re-login.";
            case 'NoZoneDataAvailable': return "User zone information was not found. Please try again after re-login.";
            default: throw new Error('Unknown local error occurred.')
        }
    }

    static readonly NoUserDataIsSet = new LocalError('NoUserDataIsSet')
    static readonly NoZoneDataAvailable = new LocalError('NoZoneDataAvailable')
}