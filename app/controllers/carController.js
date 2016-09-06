var controller = function(app) {
    this.app = app;
    app.get('/api/cars', app.checkAuth, app.checkAdmin, this.GetAllCars.bind(this));
    app.put('/api/cars', app.checkAuth, app.checkAdmin, app.bodyParser.json(), this.GetCar.bind(this));
    app.get('/api/cars/:id/license', app.checkAuth, app.checkOwner, this.GetLicenseOfCar.bind(this));
    app.get('/api/cars/:id/make', app.checkAuth, app.checkOwner, this.GetMakeOfCar.bind(this));
    app.get('/api/cars/:id/model', app.checkAuth, app.checkOwner, this.GetModelOfCar.bind(this));
    app.get('/api/cars/:id/year', app.checkAuth, app.checkOwner, this.GetYearOfCar.bind(this));
    app.get('/api/cars/:id/colour', app.checkAuth, app.checkOwner, this.GetColourOfCar.bind(this));
    app.get('/api/cars/:id/description', app.checkAuth, app.checkOwner, this.GetDescriptionOfCar.bind(this));

}

controller.prototype = {
    GetAllCars: function(req, res) {
        this.app.db.cars.find({})
        .exec()
        .then(function(docs) {
            res.sendGood('Found cars', docs.map(function(doc) { 
                return doc.toJSON({getters: true}) 
            }));
        })
        .catch(function(err) {
            res.sendBad(err)
        });
    },
    GetCar: function(req, res) {
        res.sendGood('Found car', req.doc.toJSON({getters: true}));
    },
    GetLicenseOfCar: function(req, res) {
        var license = req.doc.getLicense();
        if (!license) return res.sendBad(new Errors.MissingProperty(req.doc, 'license', license));
        res.sendGood('Found license of car', license); 
    },
    GetMakeOfCar: function(req, res) {
        var make = req.doc.getMake();
        if (!make) return res.sendBad(new Errors.MissingProperty(req.doc, 'make', make));
        res.sendGood('Found make of car', make); 
    },
    GetModelOfCar: function(req, res) {
        var model = req.doc.getModel();
        if (!model) return res.sendBad(new Errors.MissingProperty(req.doc, 'model', model));
        res.sendGood('Found model of car', model); 
    },
    GetYearOfCar: function(req, res) {
        var year = req.doc.getYear();
        if (!year) return res.sendBad(new Errors.MissingProperty(req.doc, 'year', year));
        res.sendGood('Found year of car', year); 
    },
    GetColourOfCar: function(req, res) {
        var colour = req.doc.getColour();
        if (!colour) return res.sendBad(new Errors.MissingProperty(req.doc, 'colour', colour));
        res.sendGood('Found colour of car', colour); 
    },
    GetDescriptionOfCar: function(req, res) {
        var description = req.doc.getDescription();
        if (!description) return res.sendBad(new Errors.MissingProperty(req.doc, 'description', description));
        res.sendGood('Found description of car', description); 
    }
}


module.exports = controller;