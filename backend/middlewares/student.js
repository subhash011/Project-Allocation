const studentMiddleware = (obj, req, res, next) => {
    const {statusCode, status, data} = obj;
    res.status(statusCode).json({
        status,
        statusCode,
        data
    });
};

module.exports = {
    studentMiddleware
};
