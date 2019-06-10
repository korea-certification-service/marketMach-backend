var Response = require('./Response');

class BitwebResponse {

    constructor(code, message, data) {
        this._code = code;
        this._message = message;
        this._data = data;
    }

    set code(codeNum) {
        if (codeNum) {
            this._code = codeNum;
        }
    }

    set message(codeCause) {
        if (codeCause != null ||
            codeCause != undefined) {
            this._message = codeCause;
        } else {
            this._message = '';
        }
    }

    set data(data) {
        this._data = data;
    }

    create() {
        return createMessage(this._code, this._message, this._data);
    }
}

function createMessage(codeNumber, codeCause, data) {
    var message = '';
    var cause = '';
    var responseData = {};
    var response = new Response();

    if (codeCause != null ||
        codeCause != undefined) {
        cause = ':' + codeCause;
    }

    if (responseData != null ||
        responseData != undefined) {
        responseData = data;
    }

    switch (codeNumber) {
        case 200 :
            message = "Success";
            response.responseStatus = codeNumber;
            response.responseMessage = message;
            response.data = responseData;
            return response;

        case 400 :
            message = "Bad Request" + cause;
            response.responseStatus = codeNumber;
            response.responseMessage = message;
            return response;

        case 401 :
            message = 'Unauthorized' + cause;
            response.responseStatus = codeNumber;
            response.responseMessage = message;
            return response;

        case 403 :
            message = 'Forbidden' + cause;
            response.responseStatus = codeNumber;
            response.responseMessage = message;
            return response;

        case 404 :
            message = 'Not Found' + cause;
            response.responseStatus = codeNumber;
            response.responseMessage = message;
            return response;

        case 405 :
            message = 'Method Not Allowed' + cause;
            response.responseStatus = codeNumber;
            response.responseMessage = message;
            return response;

        case 500 :
            message = 'Internal Server Error' + cause;
            response.responseStatus = codeNumber;
            response.responseMessage = message;
            return response;

        case 503 :
            message = 'Service Unavailable' + cause;
            response.responseStatus = codeNumber;
            response.responseMessage = message;
            return response;
    }
}

module.exports = BitwebResponse;
