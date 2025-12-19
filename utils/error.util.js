class AppError extends Error{
    constructor(messege,statusCode){
        super(messege);
        this.statusCode = statusCode;
        Error.captureStackTrace(this,this.constructor)
    }
}

export default AppError;