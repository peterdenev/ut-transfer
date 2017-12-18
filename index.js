module.exports = () => ({
    ports: [],
    modules: {
        currency: require('./currency'),
        transfer: require('./api/script'),
        errors: require('./errors'),
        'db/transfer': require('./api/sql')
    },
    validations: {
        transfer: require('./validations/transfer'),
        'db/transfer': require('./validations/db/transfer')
    }
});
