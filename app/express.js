var _deepEqual = require('deep-equal');
var deepEqual = function(a, b) {
    if (a instanceof Array) {
        if (a.length != b.length)
            return false;
        for (var i=0; i < a.length; i++)
            if (!_deepEqual(a[i], b[i]))
                return false;
        return true;
    }
    else return _deepEqual(a, b);
}
var sinon = require('sinon');

var exts = {
    init: function(express) {
        express.response.sendGood = this.sendGood;
        express.response.sendBad = this.sendBad;
    },

    sendGood: function(msg, obj, opt) {
        opt = opt || {};
        return this.status(opt.code || 200).
                send({
                    status: opt.status || 'SUCCESS',
                    message: msg || 'Operation successful',
                    errors: opt.errors || [],
                    data: obj
                });
    },

    sendBad: function(errs, obj, opt) {
        opt = opt || {};
        errs = (errs instanceof Array ? errs : [errs])
            .map(function(err) {
                if (typeof err === 'string')
                    return err;
                else if (err instanceof Error)
                    return err.toString();
                else return JSON.stringify(err);
            });
        return this.status(opt.status || 500)
                .send({
                    status: opt.status || 'ERROR',
                    errors: errs, 
                    data: obj
                });
    },

    mockResponse: function() {
        return {
            print: function() {
                console.log(this.send.firstCall.args[0]);
            },
            sent: function() {

            },
            sentWith: function(obj, onBody) {
                var body = this.send.firstCall.args[0];
                if (onBody) {
                    if (!body)
                        return false;
                    for (var prop in obj) {
                        var a = body[prop].toObject ? body[prop].toObject() : body[prop];
                        var b = obj[prop].toObject ? obj[prop].toObject() : obj[prop];
                        if (!deepEqual(a, b))
                            return false;
                    }
                    return true;
                }
                else {
                    var a = body.data.toObject ? body.data.toObject() : body.data;
                    var b = obj.toObject ? obj.toObject() : obj;
                    return deepEqual(a, b);
                }
            },
            sentError: function(error) {
                var args = Array.prototype.slice.call(arguments);
                if (!this.sendBad.calledOnce)
                    return false;
                if (args.length === 0)
                    return true;
                error = args.length > 1 ? args : [error];
                error = error.map(function(e) {
                    if (e instanceof Error)
                        return e.name;
                    if (typeof e === 'function')
                        return e.prototype.name;
                    return e;
                })
                var errorsCalled = this.send.firstCall.args[0].errors;
                for (var i=0; i<errorsCalled.length; i++) {
                    var _error = errorsCalled[0];
                    var type = _error.substring(0, _error.indexOf(':'));
                    if (error.indexOf(type) >= 0)
                        error.splice(error.indexOf(type), 1);
                }
                return error.length === 0 ? true : error;
            },
            status: sinon.spy(function(s) {
                return this;
            }),
            send: sinon.spy(function() {
                this.sent()
            }),
            sendStatus: sinon.spy(),
            sendGood: sinon.spy(this.sendGood),
            sendBad: sinon.spy(this.sendBad),
            redirect: sinon.spy()
        }
    },

    mockRequest: function() {
        return {
            body: {},
            query: {},
            params: {
                id: 'user.id'
            },
            doc: null,
            logout: sinon.spy()
        }
    }
}

module.exports = exts;