module.exports = function utTransfer() {
    return {
        modules: {
            currency: require('./currency'),
            transfer: require('./api/script')
        }
    };
};
