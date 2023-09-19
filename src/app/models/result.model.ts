export class RESULT<T> {
    private _result?: T;
    public get result(): T| undefined { 
        return this._result;
    }
    private set result(value: T) {
        this._result = value;
    }

    private _error?: Error;
    public get error(): Error|undefined {
        return this._error;
    }
    private set error(value: Error) {
        this._error = value;
    }

    public isError: boolean = false;
    
    private constructor() {}

    static ok<T>(value: T): RESULT<T> {
        const result = new RESULT<T>();
        result.result = value;
        result.isError = false;
        return result;
    }

    static error<T>(error: Error): RESULT<T> {
        const result = new RESULT<T>();
        result.error = error;
        result.isError = true;
        return result;
    }
}