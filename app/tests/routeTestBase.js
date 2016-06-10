var sinon = require('sinon');
var request = require('supertest');
var expect = require('chai').expect;
var server = require('./../../server');
var inject;
var funcs = [];
var verbs = {
    GET: 'GET',
    PUT: 'PUT',
    POST: 'POST',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
}
var id = '12a34567b8901c234d5e6789';



function HappyPathRouteTest(ctrl, verb, route, ignoreAdmin, ignoreAuth, method, reqMock, body, dbInjection, testOutput, assertions, done) {
    if (reqMock != null) {
        var _method = inject[ctrl].prototype[method];
        funcs.push(sinon.stub(inject[ctrl].prototype, method, function(q,s) { _method(reqMock,s); }));
    }
    
    if (!ignoreAuth)
        funcs.push(sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); }));
    if (!ignoreAdmin)
        funcs.push(sinon.stub(inject.helper, 'checkAdmin', function(q,s,n) { n(); }));
    inject.db = dbInjection || {};
    var app = server(inject);
    var st = null;
    if (verb == verbs.GET)
        st = request(app).get(route)
    else {
        if (verb == verbs.PUT)
            st = request(app).put(route)
        else if(verb == verbs.PATCH)
            st = request(app).patch(route)
        else if(verb == verbs.POST)
            st = request(app).post(route)
        else 
            st = request(app).delete(route)
        st.set('Content-Type', 'application/json')
        st.send(JSON.stringify(body))
    } 
    expect(st).to.be.not.null;
    st.expect(200).end(function (err, res) {
        expect(err).to.not.be.ok;
        if (testOutput != null) {
            var expectedOutput = JSON.stringify(testOutput).slice(1, testOutput.length - 1);
            expect(res.text).to.contain(expectedOutput);
        }
        if (assertions != null && typeof assertions === 'function')
            assertions();
        done();
    });

}

function SadPathRouteTest(verb, route, ignoreAdmin, ignoreAuth, reqMock, dbInjection, done) {
    if (reqMock != null) {
        var _method = inject[ctrl].prototype[method];
        funcs.push(sinon.stub(inject[ctrl].prototype, method, function(q,s) { _method(reqMock,s); }));
    }
    
    if (!ignoreAuth)
        funcs.push(sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); }));
    if (!ignoreAdmin)
        funcs.push(sinon.stub(inject.helper, 'checkAdmin', function(q,s,n) { n(); }));
    inject.db = dbInjection || {};
    var app = server(inject);
    var st = null;
    if (verb == verbs.GET)
        st = request(app).get(route)
    else {
        if (verb == verbs.PUT)
            st = request(app).put(route)
        else if(verb == verbs.PATCH)
            st = request(app).patch(route)
        else if(verb == verbs.POST)
            st = request(app).post(route)
        else 
            st = request(app).delete(route)
        st.set('Content-Type', 'application/json')
        st.send(JSON.stringify({}))
    } 
    expect(st).to.be.not.null;
    st.expect(500).end(function() {
        done();
    });
}

function RouteTest(ctrl, verb, route, ignoreId, ignoreAdmin, ignoreAuth, method, methodParams, done) {
    if (!ignoreAuth)
        funcs.push(sinon.stub(inject.helper, 'checkAuth', function(q,s,n) { n(); }));
    
    if (!ignoreAdmin)
        funcs.push(sinon.stub(inject.helper, 'checkAdmin', function(q,s,n) { n(); }));
            
    var func, _func;
    if (!methodParams)
        func = sinon.stub(inject[ctrl].prototype, method, function(q,s) { s.sendStatus(200) });
    else {
        func = func = sinon.spy(function(q,s) { s.sendStatus(200) });
        _func = sinon.stub(inject[ctrl].prototype, method, function(params) { return func });
        
    }
    funcs.push(func);
    if (_func != null)
        funcs.push(_func);
    
    var body = {
        someObject: {
            someProp: 'some value'
        }
    }
    var app = server(inject);
    funcs.forEach(function(spy) {
        if (spy != _func)
            spy.reset();
    })
    var st = null;
    if (verb == verbs.GET)
        st = request(app).get(route)
    else {
        if (verb == verbs.PUT)
            st = request(app).put(route)
        else if(verb == verbs.PATCH)
            st = request(app).patch(route)
        else if(verb == verbs.POST)
            st = request(app).post(route)
        else 
            st = request(app).delete(route)
        st.set('Content-Type', 'application/json')
        st.send(JSON.stringify(body))
    }
        
    expect(st).to.be.not.null;
    st.expect(200).end(function (err) {
        expect(err).to.not.be.ok;
        funcs.forEach(function (spy) {
            if (spy != _func)
                expect(spy.calledOnce, spy).to.be.true;
            else
                expect(spy.args).to.deep.include.members([methodParams]);
        })
        if (!ignoreId)
            expect(func.firstCall.args[0].params.id).to.equal(id);
        if (verb != verbs.GET)
            expect(func.firstCall.args[0].body, 'request body was not parsed/passed correctly').to.eql(body);
        
        done();
    })
}

var RouteTestBase = function(controller, tests) {
    tests.forEach(function(test) {
        var route = test.route.replace(':id', id);
        describe(test.verb + ' ' + test.route, function() {
            
            beforeEach(function() {
                inject = server.GetDefaultInjection();
            })
            
            afterEach(function() {
                while(funcs.length > 0) {
                    var func = funcs.pop();
                    if (func.restore)
                        func.restore();
                }
            })
            
            it('should call correct method', function(done) {
                RouteTest(controller, test.verb, route, test.ignoreId, test.ignoreAdmin, test.ignoreAuth, test.method, test.methodParams, done);
            })
            
            if (!test.ignoreHappyPath)
                it('should send success on happy path', function(done) {
                    HappyPathRouteTest(controller, test.verb, route, test.ignoreAdmin, test.ignoreAuth, test.method, test.req, test.body, test.dbInjection, test.output, test.assertions, done);
                })

            if (!test.ignoreSadPath)
                it('should send error on sad path', function(done) {
                    SadPathRouteTest(test.verb, route, test.ignoreAdmin, test.ignoreAuth, test.sadReq, test.sadDbInjection, done);
                })
        })
    })
} 

RouteTestBase.verbs = verbs;
RouteTestBase.RouteTest = RouteTest;
RouteTestBase.id = id;

module.exports = RouteTestBase;