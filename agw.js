module.exports = function utTransfer() {
    return {
        ports: [],
        modules: {
            transfer: {},
            transferHTTP: require('./http')
        },
        validations: {
            transfer: require('./validations/')
        }
    };
};
