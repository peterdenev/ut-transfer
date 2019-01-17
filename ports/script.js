module.exports = (...params) => class transferScript extends require('ut-port-script')(...params) {
    get defaults() {
        return {
            log: {
                transform: {
                    session: 'hide'
                }
            },
            namespace: ['transferFlow'],
            imports: ['utTransfer.transferFlow']
        };
    }
};
