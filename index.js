module.exports = () => ({
    ports: [],
    modules: {
        iso: require('./iso'),
        currency: require('./iso/currency'),
        transfer: require('./api/script'),
        'db/transfer': require('./api/sql')
    },
    validations: {
        transfer: require('./validations')
    }
});
