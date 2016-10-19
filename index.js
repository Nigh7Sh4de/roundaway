var app = require('./app/server')

app(app.GetDefaultInjection(true)).start()