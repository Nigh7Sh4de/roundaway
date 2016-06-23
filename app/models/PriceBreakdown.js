module.exports = {
    perHour: {
        type: Number,
        get: function(data) {
            return isNaN(data) ? data : data / 100;
        },
        set: function(data) {
            data = parseFloat(data) * 100;
            data = Math.round(data);
            return data;
        }
    }
}