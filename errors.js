var create = require('ut-error').define;

var Transfer = create('transfer');
var Generic = create('generic', Transfer);

module.exports = {
    transfer: function(cause) {
        return new Transfer(cause);
    },
    generic: function(cause) {
        return new Generic(cause);
    }
};
