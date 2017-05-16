var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var userMethods = require('ut-test/lib/methods/user');
var userConstants = require('ut-test/lib/constants/user').constants();
var ruleJoiValidation = require('ut-test/lib/joiValidations/rule');
var coreJoiValidation = require('ut-test/lib/joiValidations/core');
var productConstants = require('ut-test/lib/constants/product').constants();
var productJoiValidation = require('ut-test/lib/joiValidations/product');
var productParams = require('ut-test/lib/requestParams/product');
var customerMethods = require('ut-test/lib/methods/customer');
var customerConstants = require('ut-test/lib/constants/customer').constants();
var accountMethods = require('ut-test/lib/methods/account');
var productMethods = require('ut-test/lib/methods/product');
var currencyName1, operationIdWalletToWallet, priority;
var customerTypeIdIndividual, customerTypeNumberIndividual, currencyId, category1, category2, productType1, periodicFeeId, productGroupId;
const GETBYDEPTHORGANIZATION = customerConstants.GETBYDEPTHORGANIZATION;
const RANDOMCONDITIONID = customerConstants.RANDOMCONDITIONID;
const KYCDESCRIPTION = customerConstants.KYCDESCRIPTION;
const PRODUCTNAME = productConstants.PRODUCTNAME;
const STARTDATE = productConstants.STARTDATE;
const ENDDATE = productConstants.ENDDATE;
const SOURCEACCOUNTNUMBER = '$' + '{source.account.number}';
const DESTINATIONACCOUNTNUMBER = '$' + '{destination.account.number}';
const WALLETTOWALLET = 'walletToWallet';
const INDIVIDUALCUSTOMER = 'individual';
const MINCUSTOMERAGE = 18;
const MAXCUSTOMERAGE = 80;
const MINACCOUNTBALANCE = 200;
const MAXACCOUNTBALANCE = 2000;
const MINACCOUNTOPENINGBALANCE = 200;
const CURRENCY = 'currency';
const OPERATION = 'operation';
var conditionId;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'wallet to wallet transaction',
        server: opt.server,
        serverConfig: opt.serverConfig,
        client: opt.client,
        clientConfig: opt.clientConfig,
        steps: function(test, bus, run) {
            return run(test, bus, [userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                userMethods.getUser('get admin details', context => context.login['identity.check'].actorId),
                commonFunc.createStep('core.itemTranslation.fetch', 'fetch currencies', (context) => {
                    return {
                        itemTypeName: CURRENCY
                    };
                }, (result, assert) => {
                    assert.equals(coreJoiValidation.validateFetchItemTranslation(result.itemTranslationFetch[0]).error, null, 'Return all details after listing itemName');
                    currencyName1 = result.itemTranslationFetch[0].itemName;
                }),
                commonFunc.createStep('core.itemTranslation.fetch', 'fetch operations', (context) => {
                    return {
                        itemTypeName: OPERATION
                    };
                }, (result, assert) => {
                    assert.equals(coreJoiValidation.validateFetchItemTranslation(result.itemTranslationFetch[0]).error, null, 'Return all details after listing itemName');
                    operationIdWalletToWallet = result.itemTranslationFetch.find(item => item.itemCode === WALLETTOWALLET).itemNameId;
                }),
                commonFunc.createStep('db/rule.rule.fetch', 'fetch rules', (context) => {
                    return {};
                }, (result, assert) => {
                    // console.log(result);
                    var priorities = [];
                    result.condition.map(rule => {
                        priorities.push(rule.priority);
                    });
                    priority = Math.min.apply(null, priorities);
                    // console.log(priority);
                }),
                commonFunc.createStep('core.currency.fetch', 'fetch currencies', (context) => {
                    return {};
                }, (result, assert) => {
                    currencyId = result.currency[0].currencyId;
                }),
                commonFunc.createStep('customer.type.fetch', 'fetch customer types', (context) => {
                    return {};
                }, (result, assert) => {
                    var customerTypeIndividual = result.customerType.find(type => type.customerTypeId === INDIVIDUALCUSTOMER);
                    customerTypeNumberIndividual = customerTypeIndividual.customerTypeNumber;
                    customerTypeIdIndividual = customerTypeIndividual.customerTypeId;
                }),
                // add kyc
                customerMethods.getByDepthOrganization('get organizations by depth', context => GETBYDEPTHORGANIZATION),
                customerMethods.getForCreateKyc('get levels for creating kyc 1', context => {
                    return {
                        customerType: customerTypeNumberIndividual,
                        organizationId: context['get organizations by depth'].organizations[1].actorId
                    };
                }),
                customerMethods.listKycAttributes('list kyc attributes 1', context => customerTypeNumberIndividual),
                customerMethods.addKyc('add kyc 1', context => {
                    return {
                        display: context['get levels for creating kyc 1'].levels[0].itemNameTranslation,
                        customerTypeId: customerTypeNumberIndividual,
                        organizationId: context['get organizations by depth'].organizations[1].actorId,
                        itemNameId: context['get levels for creating kyc 1'].levels[0].itemNameId,
                        conditionId: RANDOMCONDITIONID,
                        attributeId: context['list kyc attributes 1'].kycAttributes[0].itemNameId

                    };
                }, KYCDESCRIPTION),
                commonFunc.createStep('customer.customerCategory.fetch', 'fetch customer categories', (context) => {
                    return {};
                }, (result, assert) => {
                    category1 = result.customerCategory[0].customerCategoryId;
                    category2 = result.customerCategory[1].customerCategoryId;
                }),
                commonFunc.createStep('ledger.productGroup.fetch', 'fetch product groups', (context) => {
                    return {};
                }, (result, assert) => {
                    productGroupId = (result.productGroup.find((group) => group.isForCustomer === true)).productGroupId;
                }),
                commonFunc.createStep('ledger.productType.fetch', 'fetch product types', (context) => {
                    return {
                        productGroupId: productGroupId
                    };
                }, (result, assert) => {
                    productType1 = result.productType[0].productTypeId;
                }),
                // fetch product periodic periodicFeeId
                commonFunc.createStep('ledger.productPeriodicFee.fetch', 'fetch product periodic fee', (context) => {
                    return {};
                }, (result, assert) => {
                    periodicFeeId = result.periodicFee[0].periodicFeeId;
                }),
                commonFunc.createStep('ledger.product.add', 'add product - all parameters', (context) => productParams.addProductParams(context, (context) => {
                    return {
                        customerTypeId: customerTypeNumberIndividual,
                        businessUnitId: context['get organizations by depth'].organizations[1].actorId,
                        currencyId: currencyId,
                        startDate: STARTDATE,
                        endDate: ENDDATE,
                        minCustomerAge: MINCUSTOMERAGE,
                        maxCustomerAge: MAXCUSTOMERAGE,
                        minAccountBalance: MINACCOUNTBALANCE,
                        maxAccountBalance: MAXACCOUNTBALANCE,
                        minAccountOpeningBalance: MINACCOUNTOPENINGBALANCE,
                        kyc: [context['add kyc 1'].kyc[0].kycId],
                        customerCategory: [category1, category2],
                        productTypeId: productType1,
                        periodicFeeId: periodicFeeId
                    };
                }, PRODUCTNAME + 1),
                (result, assert) => {
                    assert.equals(productJoiValidation.validateAddProduct(result).error, null, 'Return all details after adding a product');
                    assert.equals(result.product[0].name, PRODUCTNAME + 1, 'return product name');
                }),
                productMethods.getProduct('get product 1', (context) => context['add product - all parameters'].product[0].productId),
                productMethods.approveProduct('approve product', context => {
                    return {
                        productId: context['add product - all parameters'].product[0].productId,
                        currentVersion: context['get product 1'].product[0].currentVersion
                    };
                }),
                customerMethods.addCustomer('add customer', context => {
                    return {
                        customerTypeId: customerTypeIdIndividual,
                        organizationId: context['get organizations by depth'].organizations[1].actorId
                    };
                }),
                accountMethods.addAccount('add account 1', (context) => {
                    return {
                        ownerId: context['add customer'].customer.actorId,
                        productId: context['add product - all parameters'].product[0].productId,
                        businessUnitId: context['get organizations by depth'].organizations[1].actorId,
                        personId: context['add customer'].customer.actorId
                    };
                }, 'TestAccount' + commonFunc.generateRandomNumber()),
                accountMethods.addAccount('add account 2', (context) => {
                    return {
                        ownerId: context['add customer'].customer.actorId,
                        productId: context['add product - all parameters'].product[0].productId,
                        businessUnitId: context['get organizations by depth'].organizations[1].actorId,
                        personId: context['add customer'].customer.actorId
                    };
                }, 'TestAccount' + commonFunc.generateRandomNumber()),
                // TODO add limits and analytics
                commonFunc.createStep('db/rule.rule.add', 'add rule for wallet to wallet', (context) => {
                    return {
                        condition: {
                            priority: priority - 1 // mandatory
                        },
                        conditionItem: [{
                            factor: 'oc',
                            itemNameId: operationIdWalletToWallet
                        }],
                        split: {
                            data: {
                                rows: [{
                                    splitName: {
                                        name: 'Transfer amount', // mandatory
                                        tag: '|acquirer|agent|'
                                    },
                                    splitRange: [{
                                        isSourceAmount: false,
                                        startAmount: 0, // mandatory
                                        startAmountCurrency: currencyName1, // mandatory,
                                        percent: 100
                                    }],
                                    splitAssignment: [{
                                        credit: DESTINATIONACCOUNTNUMBER,
                                        debit: SOURCEACCOUNTNUMBER,
                                        description: 'Agent transfer amount', // mandatory
                                        percent: 100
                                    }]
                                }, {
                                    splitName: {
                                        name: 'Transfer fee', // mandatory
                                        tag: '|acquirer|agent|fee|'
                                    },
                                    splitRange: [{
                                        isSourceAmount: false,
                                        startAmount: 1, // mandatory
                                        startAmountCurrency: currencyName1, // mandatory,
                                        minValue: 100
                                    }],
                                    splitAssignment: [{
                                        credit: opt.feeAccount,
                                        debit: SOURCEACCOUNTNUMBER,
                                        description: 'Transfer fee', // mandatory
                                        percent: 100
                                    }, {
                                        credit: opt.vatAccount,
                                        debit: opt.feeAccount,
                                        description: 'VAT fee', // mandatory
                                        percent: 10
                                    }, {
                                        credit: opt.otherTaxAccount,
                                        debit: opt.feeAccount,
                                        description: 'Other tax', // mandatory
                                        percent: 18
                                    }]
                                }, {
                                    splitName: {
                                        name: 'Transfer commission', // mandatory
                                        tag: '|acquirer|agent|commission|'
                                    },
                                    splitRange: [{
                                        isSourceAmount: false,
                                        startAmount: 0, // mandatory
                                        startAmountCurrency: currencyName1, // mandatory,
                                        minValue: 150
                                    }],
                                    splitAssignment: [{
                                        credit: DESTINATIONACCOUNTNUMBER,
                                        debit: SOURCEACCOUNTNUMBER,
                                        description: 'Commission agent', // mandatory
                                        percent: 100
                                    }, {
                                        credit: '1111',
                                        debit: DESTINATIONACCOUNTNUMBER,
                                        description: 'WHT', // mandatory
                                        percent: 20
                                    }]
                                }]
                            }
                        }
                    };
                }, (result, assert) => {
                    assert.equals(ruleJoiValidation.validateAddRule(result).error, null, 'Return all detals after add rule');
                    conditionId = result.condition[0].conditionId;
                }),
                commonFunc.createStep('db/rule.decision.lookup', 'get rule for user', (context) => {
                    return {
                        // channelId: context['login admin']['identity.check'].actorId,
                        operation: context['fetch operations'].itemTranslationFetch.find(item => item.itemCode === WALLETTOWALLET).itemCode,
                        sourceAccount: context['add account 1'].account[0].accountNumber,
                        destinationAccount: context['add account 2'].account[0].accountNumber,
                        amount: '500',
                        currency: currencyName1
                    };
                }, (result, assert) => {
                    assert.equals(ruleJoiValidation.validateDecisionLookup(result).error, null, 'Return all detals after decision lookup');
                    assert.true(result.split.every(split => split.conditionId === conditionId), 'return correct conditionId');
                }),
                // commonFunc.createStep('ledgerTest.account.setBalance', 'update account balance', (context) => {
                //     return {
                //         accountId: context['add account 1'].account[0].accountId,
                //         credit: 1000,
                //         debit: 33
                //     };
                // }, (result, assert) => {
                //     console.log(result);
                // }),
                // CLEANUP FOR KYC - TODO refactor test to create organization in particular depth (consult with DB)
                customerMethods.deleteKyc('delete kyc', context => [context['add kyc 1'].kyc[0].kycId]),
                userMethods.logout('Logout admin user', context => context.login['identity.check'].sessionId)
            ]);
        }
    }, cache);
};
