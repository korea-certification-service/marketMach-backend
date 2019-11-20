/**
 * Response 모듈
 * 작성자 : Chef Kim
 * 작성일 : 2019-07-11
 */
function Response() {

    if (!(this instanceof Response)) {
        return new Response();
    }
    this.responseStatus = {};
    this.responseMessage = "";
}

module.exports = Response;
