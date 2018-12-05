module.exports = () => function utTransfer() {
    return {
        adapter: () => [
            require('./errors'),
            require('./api/sql/schema'),
            require('./api/sql/seed'),
            require('./test/schema')
        ],
        orchestrator: () => [
            require('ut-dispatch-db')(['transfer'], ['utTransfer.transfer'])
        ],
        gateway: () => [
            require('./http'),
            require('./validations')
        ],
        eft: () => [
            require('./test/mock/t24'),
            require('./currency'),
            require('./api/script')
        ]
    };
};
