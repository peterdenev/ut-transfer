module.exports = () => ({
    ports: [],
    modules: {
        transfer: require('./api/script'),
        'db/transfer': require('./api/sql')
    },
    validations: {

    }
});
