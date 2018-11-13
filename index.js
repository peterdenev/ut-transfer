module.exports = () => function utTransfer({t24Mock} = {}) {
    return [
        function adapter() {
            return {
                modules: {
                    errors: require('./errors'),
                    'db/transfer': require('./api/sql/schema'),
                    transferSeed: require('./api/sql/seed'),
                    transferTest: () => require('./test/schema')
                }
            };
        },
        function orchestrator() {
            return {
                ports: [
                    require('ut-dispatch-db')(['transfer'])
                ]
            };
        },
        function gateway() {
            return {
                modules: {
                    transferHTTP: require('./http')
                },
                validations: {
                    transfer: require('./validations/')
                }
            };
        },
        function eft() {
            return {
                ports: [
                    t24Mock && require('./test/mock/t24')
                ],
                modules: {
                    currency: require('./currency'),
                    transfer: require('./api/script')
                }
            };
        }
    ];
};
