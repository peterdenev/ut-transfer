let path = require('path');

module.exports = {
    start: function() {
        this &&
        this.registerRequestHandler &&
        this.registerRequestHandler([{
            method: 'GET',
            path: '/s/ut-transfer/repository/{p*}',
            options: {
                auth: 'jwt'
            },
            handler: {
                directory: {
                    path: path.resolve(path.join(__dirname, 'assets/static')),
                    listing: false,
                    index: false
                }
            }
        }]);
    }
};
