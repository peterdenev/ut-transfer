module.exports = () => function utTransfer() {
    return {
        browser: () => [
            function ui() {
                return require('./ui/react').ui(...arguments);
            }
        ]
    };
};
