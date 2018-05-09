module.exports = function utTransfer() {
    return {
        modules: {
            errors: require('./errors'),
            'db/transfer': require('./api/sql')
        }
    };
};
