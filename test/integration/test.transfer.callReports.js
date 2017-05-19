var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var userMethods = require('ut-test/lib/methods/user');
var userConstants = require('ut-test/lib/constants/user').constants();

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'call transfer reports',
        server: opt.server,
        serverConfig: opt.serverConfig,
        client: opt.client,
        clientConfig: opt.clientConfig,
        steps: function(test, bus, run) {
            return run(test, bus, [userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                commonFunc.createStep('db/transfer.transferDetails.get', 'call trasferDetails report', (context) => {
                    return {};
                }, (result, assert) => {
                    assert.true(typeof result, 'object', 'return result');
                }),
                commonFunc.createStep('db/transfer.report.byTypeOfTransfer', 'call trasferByType report', (context) => {
                    return {};
                }, (result, assert) => {
                    assert.true(typeof result, 'object', 'return result');
                }),
                commonFunc.createStep('db/transfer.report.byHourOfDay', 'call trasferByHourOfDay report', (context) => {
                    return {};
                }, (result, assert) => {
                    assert.true(typeof result, 'object', 'return result');
                }),
                commonFunc.createStep('db/transfer.report.byHourOfDay', 'call trasferByHourOfDay report', (context) => {
                    return {};
                }, (result, assert) => {
                    assert.true(typeof result, 'object', 'return result');
                }),
                commonFunc.createStep('db/transfer.report.byDayOfWeek', 'call trasferByHourOfWeek report', (context) => {
                    return {};
                }, (result, assert) => {
                    assert.true(typeof result, 'object', 'return result');
                }),
                commonFunc.createStep('db/transfer.report.byWeekOfYear', 'call trasferByHourOfYear report', (context) => {
                    return {};
                }, (result, assert) => {
                    assert.true(typeof result, 'object', 'return result');
                }),
                commonFunc.createStep('db/transfer.report.settlement', 'call settlement report', (context) => {
                    return {};
                }, (result, assert) => {
                    assert.true(typeof result, 'object', 'return result');
                }),
                commonFunc.createStep('db/transfer.report.settlementDetails', 'call settlementDetails report', (context) => {
                    return {};
                }, (result, assert) => {
                    assert.true(typeof result, 'object', 'return result');
                })
            ]);
        }
    }, cache);
};
