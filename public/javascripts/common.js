function getAjaxMethod(url, callback) {
    $.ajax({
        method: "GET",
        url: url,
        contentType: "application/json; charset=utf-8"
    })
    .done(function (success) {
        callback(success);
    })
    .fail(function (fail) {
        console.log(fail);
        alert('처리 실패. 관리자에게 문의하세여.');
    });
}

function postAjaxMethod(url, param, callback) {
    $.ajax({
        method: "POST",
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(param)
    })
    .done(function (success) {
        callback(success);
    })
    .fail(function (fail) {
        console.log(fail);
        alert('처리 실패. 관리자에게 문의하세여.');
    });
}

function putAjaxMethod(url, param, callback) {
    $.ajax({
        method: "PUT",
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(param)
    })
    .done(function (success) {
        callback(success);
    })
    .fail(function (fail) {
        console.log(fail);
        alert('처리 실패. 관리자에게 문의하세여.');
    });
}

function deleteAjaxMethod(url, callback) {
    $.ajax({
        method: "DELETE",
        url: url,
        contentType: "application/json; charset=utf-8"
    })
    .done(function (success) {
        callback(success);
    })
    .fail(function (fail) {
        console.log(fail);
        alert('처리 실패. 관리자에게 문의하세여.');
    });
}

function imageAjaxMethod(url, data, callback) {
    $.ajax({
        method: "POST",
        url: url,
        processData: false,
        contentType: false,
        data: data
    }).done(function (success) {
        callback(success);
    }).fail(function (fail) {
        console.log(fail);
        alert('처리 실패. 관리자에게 문의하세여.');
    })
}

function tradeStatus(status) {
    let result = '';
    switch(status) {
        case 0:
            result = '거래 등록';
            break;
        case 1:
            result = 'VTR 거래중';
            break;
        case 2:
            result = 'Point 거래중';
            break;
        case 3:
            result = '거래 완료';
            break;
    }

    return result;
}