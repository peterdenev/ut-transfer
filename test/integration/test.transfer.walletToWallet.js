var test = require('ut-run/test');
var commonFunc = require('ut-test/lib/methods/commonFunc');
var accountMethods = require('ut-test/lib/methods/account');
var customerMethods = require('ut-test/lib/methods/customer');
var productMethods = require('ut-test/lib/methods/product');
var transferMethods = require('ut-test/lib/methods/transfer');
var userMethods = require('ut-test/lib/methods/user');
var accountJoiValidation = require('ut-test/lib/joiValidations/account');
var coreJoiValidation = require('ut-test/lib/joiValidations/core');
var customerJoiValidation = require('ut-test/lib/joiValidations/customer');
var productJoiValidation = require('ut-test/lib/joiValidations/product');
var ruleJoiValidation = require('ut-test/lib/joiValidations/rule');
var transferJoiValidation = require('ut-test/lib/joiValidations/transfer');
var userJoiValidation = require('ut-test/lib/joiValidations/user');
var productParams = require('ut-test/lib/requestParams/product');
var accountConstants = require('ut-test/lib/constants/account').constants();
var coreConstants = require('ut-test/lib/constants/core').constants();
var customerConstants = require('ut-test/lib/constants/customer').constants();
var documentConstants = require('ut-test/lib/constants/document').constants();
var productConstants = require('ut-test/lib/constants/product').constants();
var ruleConstants = require('ut-test/lib/constants/rule').constants();
var transferConstants = require('ut-test/lib/constants/transfer').constants();
var userConstants = require('ut-test/lib/constants/user').constants();
const TRANSFERIDACQUIRER = transferConstants.TRANSFERIDACQUIRER;
// Customer parameters
const PHONENUMBER = customerConstants.PHONENUMBER.slice(3);
const IMEI1 = (Math.floor(100000000000000 + Math.random() * 999999999999999)).toString();
const ACCOUNTNAME = accountConstants.ACCOUNTNAME;
// Product parameters
const PRODUCTNAME = productConstants.PRODUCTNAME;
const MINACCOUNTBALANCE = 200.50;
const MAXACCOUNTBALANCE = 10000.50;
const MINACCOUNTOPENINGBALANCE = 200;
// Rule parameters
const SOURCETODESTINATIONPERCENT = 100;
const TRANSACTIONFEE = 100.50;
const TRANSACTIONFEEPERCENT = 100;
const TRANSACTIONFEEVALUE = TRANSACTIONFEE * TRANSACTIONFEEPERCENT / 100;
const FEETOVATPERCENT = 20;
const FEETOVATVALUE = TRANSACTIONFEE * FEETOVATPERCENT / 100;
const FEETOOTHERTAXPERCENT = 40;
const FEETOOTHERTAXVALUE = TRANSACTIONFEE * FEETOOTHERTAXPERCENT / 100;
// Balance parameters
const PRECISION = transferConstants.PRECISION; // the number of digits after the decimal point
var successfulTransactionsCount = 0;
var SMALLESTNUM = transferConstants.SMALLESTNUM;
const TRANSFERAMOUNT = 200;
const TRANSFERAMOUNTNEGATIVE = -200;
const DEFAULTCREDIT = 2000;
const REVERSALAMOUNTSENDER = TRANSFERAMOUNT + TRANSACTIONFEEVALUE;
const REVERSALAMOUNTRECEIVER = TRANSFERAMOUNT;
const INVALIDSTRING = commonFunc.generateRandomChars();
const NONEXISTINGACCOUNT = 'test123';
var conditionId, orgId1, organizationDepthArray;
var currencyName1, priority;
var customerTypeIndividual, customerActorId1, customerActorId2, currencyId, category1, category2, productType, productTypeId, periodicFeeId, productGroup, productGroupId, roleMobileClientId, roleTellerId;
var operationIdWalletToWallet, operationeCodeWalletToWallet, operationNameWalletToWallet;
var accountSenderId1, accountReceiverId1, accountSenderNumber1, accountReceiverNumber1, accountSenderId2, accountReceiverId2, accountSenderNumber2, accountReceiverNumber2;
var phonePrefix;
var stdPolicy;

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
                commonFunc.createStep('user.user.get', 'get admin details', (context) => {
                    return {
                        actorId: context.login['identity.check'].actorId
                    };
                }, (result, assert) => {
                    assert.equals(customerJoiValidation.validateGetPerson(result.person, userConstants.ADMINFIRSTNAME).error, null, 'return person');
                    orgId1 = result.memberOF[0].object;
                }),
                commonFunc.createStep('policy.policy.fetch', 'get std input by admin policy', (context) => {
                    return {
                        searchString: 'STD'
                    };
                }, (result, assert) => {
                    var policy = result.policy.find(
                        (singlePolicy) => singlePolicy.name.indexOf('STD_input') > -1
                    );
                    stdPolicy = policy.policyId;
                }),
                accountMethods.disableAccountMCH('enable account M/C', context => {}, 0),
                commonFunc.createStep('core.itemTranslation.fetch', 'fetch currencies', (context) => {
                    return {
                        itemTypeName: coreConstants.CURRENCY
                    };
                }, (result, assert) => {
                    assert.equals(coreJoiValidation.validateFetchItemTranslation(result.itemTranslationFetch[0]).error, null, 'Return all details after listing itemName');
                    var currency = result.itemTranslationFetch.find(curr => curr.itemCode === transferConstants.TZSCURRENCY);
                    currencyName1 = currency.itemName;
                    currencyId = currency.itemNameId;
                }),
                commonFunc.createStep('core.itemTranslation.fetch', 'fetch operations', (context) => {
                    return {
                        itemTypeName: coreConstants.OPERATION
                    };
                }, (result, assert) => {
                    assert.equals(coreJoiValidation.validateFetchItemTranslation(result.itemTranslationFetch[0]).error, null, 'Return all details after listing itemName');
                    var operationWalletToWallet = result.itemTranslationFetch.find(item => item.itemCode === transferConstants.WALLETTOWALLET);
                    operationIdWalletToWallet = operationWalletToWallet.itemNameId;
                    operationeCodeWalletToWallet = operationWalletToWallet.itemCode;
                    operationNameWalletToWallet = operationWalletToWallet.itemName;
                }),
                commonFunc.createStep('db/rule.rule.fetch', 'fetch rules', (context) => {
                    return {
                        pageSize: ruleConstants.PAGESIZE
                    };
                }, (result, assert) => {
                    var priorities = [];
                    result.condition.map(rule => {
                        priorities.push(rule.priority);
                    });
                    priority = Math.min.apply(null, priorities);
                }),
                commonFunc.createStep('customer.type.fetch', 'fetch customer types', (context) => {
                    return {};
                }, (result, assert) => {
                    customerTypeIndividual = result.customerType.find(type => type.customerTypeId === customerConstants.INDIVIDUALCUSTOMERTYPEID).customerTypeNumber;
                }),
                commonFunc.createStep('core.configuration.fetch', 'fetch defaultBu setting', (context) => {
                    return {
                        key: customerConstants.GETBYDEPTHORGANIZATION
                    };
                }, (result, assert) => {
                    var orgDepth = result[0][0].value;
                    organizationDepthArray = Array.apply(null, {length: orgDepth - 1}).map(Number.call, Number);
                    assert.true(typeof result, 'object', 'return result');
                })]
                // Create organization which correspond to the kyc's depth
                .concat(commonFunc.createStep(null, 'Create organization by depth', function(context, utils) {
                    return utils.sequence(organizationDepthArray.map(org => {
                        return commonFunc.createStep(null, 'Add and approve organizations', function(context1, utils2) {
                            return utils2.sequence([
                                commonFunc.createStep('customer.organization.add', 'add organization', context2 => {
                                    return {
                                        organization: {
                                            organizationName: customerConstants.ORGNAME
                                        },
                                        parent: [orgId1]
                                    };
                                }, (result, assert) => {
                                    orgId1 = result['organization.info'][0].actorId;
                                    assert.equals(customerJoiValidation.validateAddOrganization(result['organization.info'][0]).error, null, 'return all details after creating the organization');
                                }),
                                customerMethods.approveOrganization('approve organization', context2 => orgId1)]
                                ).then(() => {
                                    return {};
                                });
                        }, (result, assert) => {
                            assert.pass('Add and approve organization passed');
                        });
                    }
                    ));
                }, (result, assert) => {
                    assert.pass('Create organizations by depth passed');
                }))
                .concat([
                    // Kyc setup
                    customerMethods.getForCreateKyc('get levels for creating kyc 1', context => {
                        return {
                            customerType: customerTypeIndividual,
                            organizationId: orgId1
                        };
                    }),
                    customerMethods.listKycAttributes('list kyc attributes 1', context => customerTypeIndividual),
                    customerMethods.addKyc('add kyc 1', context => {
                        return {
                            display: context['get levels for creating kyc 1'].levels[0].itemNameTranslation,
                            customerTypeId: customerTypeIndividual,
                            organizationId: orgId1,
                            itemNameId: context['get levels for creating kyc 1'].levels[0].itemNameId,
                            conditionId: customerConstants.RANDOMCONDITIONID,
                            attributeId: context['list kyc attributes 1'].kycAttributes[0].itemNameId

                        };
                    }, customerConstants.KYCDESCRIPTION),
                    commonFunc.createStep('customer.customerCategory.fetch', 'fetch customer categories', (context) => {
                        return {};
                    }, (result, assert) => {
                        category1 = result.customerCategory[0].customerCategoryId;
                        category2 = result.customerCategory[1].customerCategoryId;
                    }),
                    // Customer setup
                    commonFunc.createStep('customer.selfregister', 'self register customer 1', (context) => {
                        return {
                            uri: customerConstants.SELFREGURI,
                            firstName: customerConstants.FIRSTNAME,
                            lastName: customerConstants.LASTNAME,
                            dateOfBirth: customerConstants.DATEOFBIRTH,
                            gender: customerConstants.GENDERM,
                            phoneNumber: PHONENUMBER,
                            documentTypeId: documentConstants.DOCUMENTTYPEID,
                            documentNumber: documentConstants.DOCUMENTNUMBER,
                            lat: customerConstants.LAT,
                            lng: customerConstants.LNG,
                            actorDevice: {
                                installationId: customerConstants.INSTALLATIONID,
                                imei: customerConstants.IMEI
                            }
                        };
                    }, (result, assert) => {
                        customerActorId1 = result.actorId;
                        assert.equals(result.success, true, 'return success: true');
                    }),
                    commonFunc.createStep('user.user.get', 'get first customer details', (context) => {
                        return {
                            actorId: customerActorId1
                        };
                    }, (result, assert) => {
                        assert.equals(customerJoiValidation.validateGetPerson(result.person, customerConstants.FIRSTNAME).error, null, 'return person');
                        assert.equals(result['user.hash'][0].identifier, PHONENUMBER, 'return username = customer phone number in user.hash');
                        roleMobileClientId = result.rolesPossibleForAssign.find(role => role.name === transferConstants.MOBILECLIENT && role.isAssigned === 1).roleId;
                        roleTellerId = result.rolesPossibleForAssign.find(role => role.name === transferConstants.TELLER).roleId;
                    }),
                    commonFunc.createStep('ledger.userAccountByPhoneNumber.get', 'get account by phone number', context => {
                        return {
                            phoneNumber: PHONENUMBER
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateGetUserAccountByPhoneNumber(result).error, null, 'return correct details for customer accounts by phone number');
                        phonePrefix = result.customerData[0].phonePrefix;
                    }),
                    commonFunc.createStep('customer.selfregister', 'self register customer 2', (context) => {
                        return {
                            uri: customerConstants.SELFREGURI,
                            firstName: customerConstants.FIRSTNAME,
                            lastName: customerConstants.LASTNAME + 'Second',
                            dateOfBirth: customerConstants.DATEOFBIRTH,
                            gender: customerConstants.GENDERM,
                            phoneNumber: PHONENUMBER + '2',
                            documentTypeId: documentConstants.DOCUMENTTYPEID,
                            documentNumber: documentConstants.DOCUMENTNUMBER + 1,
                            lat: customerConstants.LAT,
                            lng: customerConstants.LNG,
                            actorDevice: {
                                installationId: customerConstants.INSTALLATIONID,
                                imei: IMEI1
                            }
                        };
                    }, (result, assert) => {
                        customerActorId2 = result.actorId;
                        assert.equals(result.success, true, 'return success: true');
                    }),
                    commonFunc.createStep('user.user.get', 'get second customer details', (context) => {
                        return {
                            actorId: customerActorId2
                        };
                    }, (result, assert) => {
                        assert.equals(customerJoiValidation.validateGetPerson(result.person, customerConstants.FIRSTNAME).error, null, 'return person');
                        assert.equals(result['user.hash'][0].identifier, PHONENUMBER + '2', 'return username = customer phone number in user.hash');
                    }),
                    commonFunc.createStep('ledger.account.fetch', 'fetch default receiver account', context => {
                        return {
                            filterBy: {
                                ownerId: customerActorId2
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateFetchAccount(result.account).error, null, 'Return all details after fetching account');
                        productGroup = result.account[0].productGroup;
                        productType = result.account[0].productType;
                    }),
                    // Teller user setup
                    userMethods.addUser('add teller', context => {
                        return {
                            object: context['get admin details'].memberOF[0].object,
                            policyId: stdPolicy,
                            roles: [roleTellerId],
                            defaultRoleId: roleTellerId
                        };
                    }, userConstants.USERNAME),
                    userMethods.approveUser('approve first user', context => context['add teller'].person.actorId),
                    // Product setup
                    commonFunc.createStep('ledger.productGroup.fetch', 'fetch product groups', (context) => {
                        return {
                            isForCustomer: 1
                        };
                    }, (result, assert) => {
                        productGroupId = (result.productGroup.find((group) => group.name === productGroup)).productGroupId;
                    }),
                    commonFunc.createStep('ledger.productType.fetch', 'fetch product types', (context) => {
                        return {
                            productGroupId: productGroupId
                        };
                    }, (result, assert) => {
                        productTypeId = result.productType.find((type) => type.name === productType).productTypeId;
                    }),
                    commonFunc.createStep('ledger.productPeriodicFee.fetch', 'fetch product periodic fee', (context) => {
                        return {};
                    }, (result, assert) => {
                        periodicFeeId = result.periodicFee[0].periodicFeeId;
                    }),
                    commonFunc.createStep('ledger.product.add', 'add first product', (context) => productParams.addProductParams(context, (context) => {
                        return {
                            customerTypeId: customerTypeIndividual,
                            businessUnitId: orgId1,
                            currencyId: currencyId,
                            startDate: productConstants.STARTDATE,
                            endDate: productConstants.ENDDATE,
                            minAccountOpeningBalance: MINACCOUNTOPENINGBALANCE,
                            kyc: [context['add kyc 1'].kyc[0].kycId],
                            customerCategory: [category1, category2],
                            productTypeId: productTypeId,
                            periodicFeeId: periodicFeeId
                        };
                    }, PRODUCTNAME + 1),
                    (result, assert) => {
                        assert.equals(productJoiValidation.validateAddProduct(result).error, null, 'Return all details after adding a product');
                        assert.equals(result.product[0].name, PRODUCTNAME + 1, 'return product name');
                    }),
                    productMethods.getProduct('get first product 1', (context) => context['add first product'].product[0].productId),
                    productMethods.approveProduct('approve first product', context => {
                        return {
                            productId: context['add first product'].product[0].productId,
                            currentVersion: context['get first product 1'].product[0].currentVersion
                        };
                    }),
                    productMethods.getProduct('get first product 2', (context) => context['add first product'].product[0].productId),
                    commonFunc.createStep('ledger.product.add', 'add second product', (context) => productParams.addProductParams(context, (context) => {
                        return {
                            customerTypeId: customerTypeIndividual,
                            businessUnitId: orgId1,
                            currencyId: currencyId,
                            startDate: productConstants.STARTDATE,
                            endDate: productConstants.ENDDATE,
                            minAccountOpeningBalance: MINACCOUNTOPENINGBALANCE,
                            kyc: [context['add kyc 1'].kyc[0].kycId],
                            customerCategory: [category1, category2],
                            productTypeId: productTypeId,
                            periodicFeeId: periodicFeeId
                        };
                    }, PRODUCTNAME + 2),
                    (result, assert) => {
                        assert.equals(productJoiValidation.validateAddProduct(result).error, null, 'Return all details after adding a product');
                        assert.equals(result.product[0].name, PRODUCTNAME + 2, 'return product name');
                    }),
                    productMethods.getProduct('get second product 1', (context) => context['add second product'].product[0].productId),
                    productMethods.approveProduct('approve second product', context => {
                        return {
                            productId: context['add second product'].product[0].productId,
                            currentVersion: context['get second product 1'].product[0].currentVersion
                        };
                    }),
                    productMethods.getProduct('get second product 2', (context) => context['add second product'].product[0].productId),
                    // Accounts setup
                    commonFunc.createStep('ledger.account.add', 'add sender account 1', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customerActorId1,
                                productId: context['add first product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: customerActorId1
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                        var account = result.account.find(account => account.accountName === ACCOUNTNAME);
                        accountSenderId1 = account.accountId;
                        accountSenderNumber1 = account.accountNumber;
                    }),
                    accountMethods.approveAccount('approve sender account 1', context => {
                        return {
                            accountId: accountSenderId1
                        };
                    }),
                    commonFunc.createStep('ledger.account.add', 'add receiver account 1', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customerActorId2,
                                productId: context['add second product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME + 2
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: customerActorId2
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                        var account = result.account.find(account => account.accountName === ACCOUNTNAME + 2);
                        accountReceiverId1 = account.accountId;
                        accountReceiverNumber1 = account.accountNumber;
                    }),
                    accountMethods.approveAccount('approve sender account 1', context => {
                        return {
                            accountId: accountReceiverId1
                        };
                    }),
                    accountMethods.fetchAccount('fetch fee account id', context => {
                        return {
                            accountNumber: opt.feeWalletToWallet
                        };
                    }),
                    accountMethods.fetchAccount('fetch vat account id', context => {
                        return {
                            accountNumber: opt.vatWalletToWallet
                        };
                    }),
                    accountMethods.fetchAccount('fetch otherTax account id', context => {
                        return {
                            accountNumber: opt.otherTaxWalletToWallet
                        };
                    }),
                    /** RULE SETUP
                     * @conditionItem @conditionActor - used to define permissions for the transaction (which role, sender and receiver product, transaction type)
                     * @splitRange - defines the amount which will be splitted between the different accounts.
                     * The split range amount may be defined as "percent" (percent of the transaction amount) OR minValue(amount which is not calculated from the transaction amount)
                     * @splitAssignment - defines the way in which the amount in the split range will be splitted between the different accounts.
                     */
                    commonFunc.createStep('db/rule.rule.add', 'add rule for wallet to wallet', (context) => {
                        return {
                            condition: {
                                priority: priority - 1 // mandatory
                            },
                            conditionItem: [{
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdWalletToWallet
                            }, {
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get first product 2'].product[0].itemNameId
                            },
                            {
                                factor: ruleConstants.DESTINATIONCATEGORY, // destination.account.product
                                itemNameId: context['get second product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }, {
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Wallet to wallet',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: SOURCETODESTINATIONPERCENT
                                        }],
                                        splitAssignment: [{
                                            // Pulls funds from the sender customer account and sends them to the receiver account.
                                            // The sent amount is percent(SOURCETODESTINATIONPERCENT) of the transferred amount defined in transaction.execute
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            description: 'Agent amount - Transfer',
                                            percent: SOURCETODESTINATIONPERCENT
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE
                                        }],
                                        splitAssignment: [{
                                            // Pulls funds from the sender customer account and sends them to the GL fee account.
                                            // The sent amount is percent of the amount defined in the split range (TRANSACTIONFEEPERCENT * TRANSACTIONFEE / 100)
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeWalletToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Wallet to wallet'
                                        }, {
                                            // Pulls funds from the GL fee account and sends them to the GL VAT account.
                                            // The sent amount is percent of the amount defined in the split range (FEETOVATPERCENT * TRANSACTIONFEE / 100)
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.vatWalletToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            // Pulls funds from the GL fee account and sends them to the GL other tax account.
                                            // The sent amount is percent of the amount defined in the split range (FEETOOTHERTAXPERCENT * TRANSACTIONFEE / 100)
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.otherTaxWalletToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateAddRule(result).error, null, 'Return all detals after add rule');
                        conditionId = result.condition[0].conditionId;
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    commonFunc.createStep('identity.check', 'login user 1', (context) => {
                        return {
                            username: PHONENUMBER,
                            password: context['self register customer 1'].token,
                            newPassword: userConstants.ADMINPASSWORD,
                            uri: userConstants.URI,
                            timezone: userConstants.TIMEZONE,
                            channel: userConstants.MOBCHANNEL
                        };
                    }, (result, assert) => {
                        assert.equals(userJoiValidation.validateLogin(result['identity.check']).error, null, 'Return all details after login a user');
                    }),
                    commonFunc.createStep('db/rule.decision.lookup', 'get rule for user', (context) => {
                        return {
                            channelId: customerActorId1,
                            operation: operationeCodeWalletToWallet,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            amount: TRANSFERAMOUNT,
                            currency: currencyName1
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateDecisionLookup(result).error, null, 'Return all detals after decision lookup');
                        assert.true(result.split.every(split => split.conditionId === conditionId), 'return correct conditionId');
                    }),
                    /** Scenarios for product which is without min and max account balance */
                    transferMethods.setBalance('set sender balance < TRANSFERAMOUNT + TRANSACTIONFEEVALUE',
                        context => [accountSenderId1], commonFunc.roundNumber(TRANSFERAMOUNT + TRANSACTIONFEEVALUE - SMALLESTNUM, PRECISION)),
                    transferMethods.setBalance('set default balance in fee, vat and otherTax accounts',
                        context => [context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId, context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - insufficient balance in sender account', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Insufficient balance in sender account');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet to wallet transaction - insufficient balance in sender account', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 1,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Insufficient balance in sender account');
                    }),
                    transferMethods.setBalance('set sender balance equal to TRANSFERAMOUNT + TRANSACTIONFEEVALUE',
                        context => [accountSenderId1], TRANSFERAMOUNT + TRANSACTIONFEEVALUE),
                    commonFunc.createStep('transaction.validate', 'successful transaction validation - minimum sufficient balance in sender account', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after validating transaction');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountSenderNumber1, 'return correct source account number');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.sourceAccount.msisdn, phonePrefix + PHONENUMBER, 'return correct source msisdn');
                        assert.equals(result.sourceAccount.customerName, customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME, 'return correct source customer name');
                        assert.equals(result.destinationAccount.accountNumber, accountReceiverNumber1, 'return correct destination account number');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + '2', 'return correct destination account name');
                        assert.equals(result.destinationAccount.msisdn, phonePrefix + PHONENUMBER + '2', 'return correct destination msisdn');
                        assert.equals(result.destinationAccount.customerName, customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME + 'Second', 'return correct destination customer name');
                        assert.equals(result.transferType, operationeCodeWalletToWallet, 'return correct transferType');
                        assert.equals(result.description, operationNameWalletToWallet, 'return correct description');
                        assert.equals(result.currency, currencyName1, 'return correct currency');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet to wallet transaction - minimum sufficient balance in sender account', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 2,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 2, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeWalletToWallet, 'return correct transferType');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout user 1', context => context['login user 1']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 1', context => accountSenderId1, 0),
                    accountMethods.getAccountBalance('get receiver account balance 1', context => accountReceiverId1, TRANSFERAMOUNT),
                    accountMethods.getAccountBalance('get fee account balance 1', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 1', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 1', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    /** Scenarios with product which is with min and max account balance */
                    productMethods.editProduct('edit first product - set min and max account balances', context => {
                        return {
                            productId: context['get first product 2'].product[0].productId,
                            minAccountBalance: MINACCOUNTBALANCE,
                            maxAccountBalance: MAXACCOUNTBALANCE
                        };
                    }),
                    productMethods.getProduct('get first product 3', (context) => context['add first product'].product[0].productId),
                    productMethods.approveProduct('approve first product after edit 1', context => {
                        return {
                            productId: context['add first product'].product[0].productId,
                            currentVersion: context['get first product 3'].product[0].currentVersion
                        };
                    }),
                    productMethods.editProduct('edit second product - set min and max account balances', context => {
                        return {
                            productId: context['get second product 2'].product[0].productId,
                            minAccountBalance: MINACCOUNTBALANCE,
                            maxAccountBalance: MAXACCOUNTBALANCE
                        };
                    }),
                    productMethods.getProduct('get second product 3', (context) => context['add second product'].product[0].productId),
                    productMethods.approveProduct('approve second product after edit', context => {
                        return {
                            productId: context['add second product'].product[0].productId,
                            currentVersion: context['get second product 3'].product[0].currentVersion
                        };
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 2', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set sender account balance less than product min account balance + wallet to wallet fee + transfer amount',
                        context => [accountSenderId1], commonFunc.roundNumber(MINACCOUNTBALANCE + TRANSACTIONFEEVALUE + TRANSFERAMOUNT - SMALLESTNUM, PRECISION)),
                    transferMethods.setBalance('set default balance in receiver, fee, vat and otherTax accounts',
                        context => [accountReceiverId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    // product min account balance
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - sender account balance less than product min account balance + wallet to wallet fee + transfer amount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'return failure - insufficient balance');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet trans - sender account balance less than product min account balance + wallet to wallet fee + transfer amount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 3,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'return failure - insufficient balance');
                    }),
                    transferMethods.setBalance('set sender account balance equal to product min account balance + wallet to wallet fee + transfer amount',
                        context => [accountSenderId1], commonFunc.roundNumber(MINACCOUNTBALANCE + TRANSACTIONFEEVALUE + TRANSFERAMOUNT, PRECISION)),
                    commonFunc.createStep('transaction.validate', 'successful transaction validation - sender account balance equal to product min account balance + wallet to wallet fee + transfer amount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after validating transaction');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountSenderNumber1, 'return correct source account number');
                        assert.equals(result.destinationAccount.accountNumber, accountReceiverNumber1, 'return correct destination account number');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet trans - sender account balance equal to product min account balance + wallet to wallet fee + transfer amount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 4,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout user 2', context => context['login user 2']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 2', context => accountSenderId1, MINACCOUNTBALANCE),
                    accountMethods.getAccountBalance('get receiver account balance 2', context => accountReceiverId1, DEFAULTCREDIT + TRANSFERAMOUNT),
                    accountMethods.getAccountBalance('get fee account balance 2', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 2', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 2', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 3', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // product max account balance
                    transferMethods.setBalance('set receiver account balance more than product max account balance - transfer amount',
                        context => [accountReceiverId1], commonFunc.roundNumber(MAXACCOUNTBALANCE - TRANSFERAMOUNT + SMALLESTNUM, PRECISION)),
                    transferMethods.setBalance('set default balance in sender, fee, vat and otherTax accounts',
                        context => [accountSenderId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - receiver account balance more than product max account balance - transfer amount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Account balance does not meet product limits - receiver balance more than max product limit');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet trans - receiver account balance more than product max account balance - transfer amount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 5,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Account balance does not meet product limits - receiver balance more than max product limit');
                    }),
                    transferMethods.setBalance('set receiver account balance equal to product max account balance - transfer amount',
                        context => [accountReceiverId1], commonFunc.roundNumber(MAXACCOUNTBALANCE - TRANSFERAMOUNT, PRECISION)),
                    commonFunc.createStep('transaction.validate', 'successful transaction validation - receiver account balance equal to product max account balance - transfer amount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after validating transaction');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountSenderNumber1, 'return correct source account number');
                        assert.equals(result.destinationAccount.accountNumber, accountReceiverNumber1, 'return correct destination account number');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet trans - receiver account balance equal to product max account balance - transfer amount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 6,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout user 3', context => context['login user 3']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 3', context => accountSenderId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE),
                    accountMethods.getAccountBalance('get receiver account balance 3', context => accountReceiverId1, MAXACCOUNTBALANCE),
                    accountMethods.getAccountBalance('get fee account balance 3', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 3', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 3', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    /** Scenarios for rule limits - limits are applied to the source account */
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxCountDaily limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdWalletToWallet
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get first product 2'].product[0].itemNameId
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.DESTINATIONCATEGORY, // destination.account.product
                                itemNameId: context['get second product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }, {
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            limit: [{
                                conditionId: conditionId,
                                currency: currencyName1,
                                maxCountDaily: successfulTransactionsCount + 1
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Wallet to wallet',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: SOURCETODESTINATIONPERCENT
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            description: 'Agent amount - Transfer',
                                            percent: SOURCETODESTINATIONPERCENT
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeWalletToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Wallet to wallet'
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.vatWalletToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.otherTaxWalletToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                        assert.equals(result.limit[0].maxCountDaily, (successfulTransactionsCount + 1).toString(), 'return correct maxCountDaily limit');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 4', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('db/rule.decision.lookup', 'get rule for user', (context) => {
                        return {
                            channelId: customerActorId1,
                            operation: operationeCodeWalletToWallet,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            amount: TRANSFERAMOUNT,
                            currency: currencyName1
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateDecisionLookup(result).error, null, 'Return all detals after decision lookup');
                        assert.true(result.split.every(split => split.conditionId === conditionId), 'return correct conditionId');
                    }),
                    transferMethods.setBalance('set default balance in all accounts',
                        context => [accountSenderId1,
                            accountReceiverId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction - within the limits of rule maxCountDaily', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 8,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - rule maxCountDaily limit already reached', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.DAILYLIMITCOUNTERROR, 'daily transaction count limit reached');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - rule maxCountDaily limit already reached', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 9,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.DAILYLIMITCOUNTERROR, 'daily transaction count limit reached');
                    }),
                    userMethods.logout('logout user 4', context => context['login user 4']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 4', context => accountSenderId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get receiver account balance 4', context => accountReceiverId1, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 4', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 4', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 4', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller', userConstants.USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                    // reverse
                    commonFunc.createStep('transaction.reverse.execute', 'successfully reverse transaction', (context) => {
                        return {
                            transferId: context['successfully execute wallet-to-wallet transaction - within the limits of rule maxCountDaily'].transferId
                        };
                    }, (result, assert) => {
                        assert.equals(result.success, true, 'return successs');
                    }),
                    userMethods.logout('logout teller', context => context['login teller']['identity.check'].sessionId),
                    userMethods.loginMobile('login user 5', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction by teller - within the limits of rule maxCountDaily after reversal', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '8a',
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                    }),
                    userMethods.logout('logout user 5', context => context['login user 5']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 4r', context => accountSenderId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get receiver account balance 4r', context => accountReceiverId1, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 4r', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 4r', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 4r', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add minAmount, maxAmount limits', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1 // mandatory
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdWalletToWallet
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get first product 2'].product[0].itemNameId
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.DESTINATIONCATEGORY, // destination.account.product
                                itemNameId: context['get second product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }, {
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            limit: [{
                                conditionId: conditionId,
                                currency: currencyName1,
                                minAmount: TRANSFERAMOUNT,
                                maxAmount: TRANSFERAMOUNT
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Wallet to wallet',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: SOURCETODESTINATIONPERCENT
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            description: 'Agent amount - Transfer',
                                            percent: SOURCETODESTINATIONPERCENT
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeWalletToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Wallet to wallet'
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.vatWalletToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.otherTaxWalletToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                        assert.equals(result.limit[0].minAmount, TRANSFERAMOUNT, 'return correct minAmount limit');
                        assert.equals(result.limit[0].maxAmount, TRANSFERAMOUNT, 'return correct maxAmount limit');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 6', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 1',
                        context => [accountSenderId1,
                            accountReceiverId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - amount less than rule minAmount limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MINLIMITAMOUNTERROR, 'Transaction amount is below minimum');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - amount less than rule minAmount limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 10,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MINLIMITAMOUNTERROR, 'Transaction amount is below minimum');
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - amount more than rule maxAmount limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MAXLIMITAMOUNTERROR, 'Transaction amount is above maximum');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - amount more than rule maxAmount limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 11,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MAXLIMITAMOUNTERROR, 'Transaction amount is above maximum');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction - within the limits of min and max amount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 12,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout user 6', context => context['login user 6']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 5', context => accountSenderId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get receiver account balance 5', context => accountReceiverId1, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 5', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 5', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 5', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxAmountDaily limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1 // mandatory
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdWalletToWallet
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get first product 2'].product[0].itemNameId
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.DESTINATIONCATEGORY, // destination.account.product
                                itemNameId: context['get second product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }, {
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            limit: [{
                                conditionId: conditionId,
                                currency: currencyName1,
                                maxAmountDaily: (successfulTransactionsCount + 1) * TRANSFERAMOUNT
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Wallet to wallet',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: SOURCETODESTINATIONPERCENT
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            description: 'Agent amount - Transfer',
                                            percent: SOURCETODESTINATIONPERCENT
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeWalletToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Wallet to wallet'
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.vatWalletToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.otherTaxWalletToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                        assert.equals(result.limit[0].maxAmountDaily, (successfulTransactionsCount + 1) * TRANSFERAMOUNT, 'return correct maxAmountDaily limit');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 7', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 2',
                        context => [accountSenderId1,
                            accountReceiverId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - daily amount more than rule maxAmountDaily limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.DAILYLIMITAMOUNTERROR, 'Transaction amount is above maximum');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - daily amount more than rule maxAmountDaily limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 13,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.DAILYLIMITAMOUNTERROR, 'Transaction amount is above maximum');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction - within the limits of rule maxAmountDaily limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 14,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout user 7', context => context['login user 7']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 6', context => accountSenderId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get receiver account balance 6', context => accountReceiverId1, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 6', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 6', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 6', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxAmountWeekly limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1 // mandatory
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdWalletToWallet
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get first product 2'].product[0].itemNameId
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.DESTINATIONCATEGORY, // destination.account.product
                                itemNameId: context['get second product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }, {
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            limit: [{
                                conditionId: conditionId,
                                currency: currencyName1,
                                maxAmountWeekly: (successfulTransactionsCount + 1) * TRANSFERAMOUNT
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Wallet to wallet',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: SOURCETODESTINATIONPERCENT
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            description: 'Agent amount - Transfer',
                                            percent: SOURCETODESTINATIONPERCENT
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeWalletToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Wallet to wallet'
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.vatWalletToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.otherTaxWalletToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                        assert.equals(result.limit[0].maxAmountWeekly, (successfulTransactionsCount + 1) * TRANSFERAMOUNT, 'return correct maxAmountWeekly limit');
                    }),
                    transferMethods.setBalance('set default balance in all accounts 3',
                        context => [accountSenderId1,
                            accountReceiverId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 8', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - weekly amount more than rule maxAmountWeekly limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.WEEKLYLIMITAMOUNTERROR, 'Weekly transaction amount is above rule maximum weekly amount limit');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - weekly amount more than rule maxAmountWeekly limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 15,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.WEEKLYLIMITAMOUNTERROR, 'Weekly transaction amount is above rule maximum weekly amount limit');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction - within the limits of rule maxAmountWeekly limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 16,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout user 8', context => context['login user 8']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 7', context => accountSenderId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get receiver account balance 7', context => accountReceiverId1, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 7', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 7', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 7', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxCountWeekly limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1 // mandatory
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdWalletToWallet
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get first product 2'].product[0].itemNameId
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.DESTINATIONCATEGORY, // destination.account.product
                                itemNameId: context['get second product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }, {
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            limit: [{
                                conditionId: conditionId,
                                currency: currencyName1,
                                maxCountWeekly: successfulTransactionsCount + 1
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Wallet to wallet',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: SOURCETODESTINATIONPERCENT
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            description: 'Agent amount - Transfer',
                                            percent: SOURCETODESTINATIONPERCENT
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeWalletToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Wallet to wallet'
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.vatWalletToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.otherTaxWalletToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                        assert.equals(result.limit[0].maxCountWeekly, (successfulTransactionsCount + 1).toString(), 'return correct maxCountWeekly limit');
                    }),
                    transferMethods.setBalance('set default balance in all accounts 4',
                        context => [accountSenderId1,
                            accountReceiverId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 9', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction - within the limits of rule maxCountWeekly limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 17,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - rule maxCountWeekly limit already reached', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.WEEKLYLIMITCOUNTERROR, 'weekly transaction count limit reached');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - rule maxCountWeekly limit already reached', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 18,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.WEEKLYLIMITCOUNTERROR, 'weekly transaction count limit reached');
                    }),
                    userMethods.logout('logout user 9', context => context['login user 9']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 8', context => accountSenderId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get receiver account balance 8', context => accountReceiverId1, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 8', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 8', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 8', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxAmountMonthly limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1 // mandatory
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdWalletToWallet
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get first product 2'].product[0].itemNameId
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.DESTINATIONCATEGORY, // destination.account.product
                                itemNameId: context['get second product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }, {
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            limit: [{
                                conditionId: conditionId,
                                currency: currencyName1,
                                maxAmountMonthly: (successfulTransactionsCount + 1) * TRANSFERAMOUNT
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Wallet to wallet',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: SOURCETODESTINATIONPERCENT
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            description: 'Agent amount - Transfer',
                                            percent: SOURCETODESTINATIONPERCENT
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeWalletToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Wallet to wallet'
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.vatWalletToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.otherTaxWalletToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                        assert.equals(result.limit[0].maxAmountMonthly, (successfulTransactionsCount + 1) * TRANSFERAMOUNT, 'return correct maxAmountMonthly limit');
                    }),
                    transferMethods.setBalance('set default balance in all accounts 5',
                        context => [accountSenderId1,
                            accountReceiverId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 10', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - monthly amount more than rule maxAmountMonthly limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MONTHLYLIMITAMOUNTERROR, 'Monthly transaction amount is above rule maximum monthly amount limit');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - monthly amount more than rule maxAmountMonthly limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 19,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MONTHLYLIMITAMOUNTERROR, 'Monthly transaction amount is above rule maximum monthly amount limit');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction - within the limits of rule maxAmountMonthly limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 20,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout user 10', context => context['login user 10']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 9', context => accountSenderId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get receiver account balance 9', context => accountReceiverId1, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 9', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 9', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 9', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxCountMonthly limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1 // mandatory
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdWalletToWallet
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get first product 2'].product[0].itemNameId
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.DESTINATIONCATEGORY, // destination.account.product
                                itemNameId: context['get second product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }, {
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            limit: [{
                                conditionId: conditionId,
                                currency: currencyName1,
                                maxCountMonthly: successfulTransactionsCount + 1
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Wallet to wallet',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: SOURCETODESTINATIONPERCENT
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            description: 'Agent amount - Transfer',
                                            percent: SOURCETODESTINATIONPERCENT
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeWalletToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Wallet to wallet'
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.vatWalletToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.otherTaxWalletToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                        assert.equals(result.limit[0].maxCountMonthly, (successfulTransactionsCount + 1).toString(), 'return correct maxCountMonthly limit');
                    }),
                    transferMethods.setBalance('set default balance in all accounts 6',
                        context => [accountSenderId1,
                            accountReceiverId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 11', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction - within the limits of rule maxCountMonthly limit', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 21,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - rule maxCountDaily limit already reached', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MONTHLYLIMITCOUNTERROR, 'monthly transaction count limit reached');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - rule maxCountDaily limit already reached', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 'w',
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MONTHLYLIMITCOUNTERROR, 'monthly transaction count limit reached');
                    }),
                    userMethods.logout('logout user 11', context => context['login user 11']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 10', context => accountSenderId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get receiver account balance 10', context => accountReceiverId1, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 10', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 10', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 10', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - remove limits', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1 // mandatory
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdWalletToWallet
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get first product 2'].product[0].itemNameId
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.DESTINATIONCATEGORY, // destination.account.product
                                itemNameId: context['get second product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }, {
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Wallet to wallet',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: SOURCETODESTINATIONPERCENT
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            description: 'Agent amount - Transfer',
                                            percent: SOURCETODESTINATIONPERCENT
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            isSourceAmount: 0,
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeWalletToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Wallet to wallet'
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.vatWalletToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeWalletToWallet,
                                            credit: opt.otherTaxWalletToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax - Wallet to wallet',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                    }),
                    commonFunc.createStep('ledger.account.add', 'add sender account 2', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customerActorId1,
                                productId: context['add first product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME + 3
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: customerActorId1
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                        accountSenderId2 = result.account[0].accountId;
                        accountSenderNumber2 = result.account[0].accountNumber;
                    }),
                    commonFunc.createStep('ledger.account.add', 'add receiver account 2', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customerActorId2,
                                productId: context['add second product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME + 4
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: customerActorId2
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                        accountReceiverId2 = result.account[0].accountId;
                        accountReceiverNumber2 = result.account[0].accountNumber;
                    }),
                    transferMethods.setBalance('set default balance in all accounts 7',
                        context => [accountSenderId1,
                            accountSenderId2,
                            accountReceiverId1,
                            accountReceiverId2,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 12', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    /** Negative scenarios for status - transactions can be processed only for accounts in status approved */
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - destination account in status new', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber2
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTSTATUSFAILURE, 'return failure - account not found');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - destination account in status new', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber2,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 22,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTSTATUSFAILURE, 'return failure - account not found');
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - source account in status new', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber2
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - source account in status new', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber2,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 23,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found');
                    }),
                    userMethods.logout('logout user 12', context => context['login user 12']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances are unchanged in all accounts
                    accountMethods.getAccountBalance('get sender account balance 11', context => accountSenderId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get receiver account balance 11', context => accountReceiverId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 11', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 11', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 11', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.approveAccount('approve sender account 2', context => {
                        return {
                            accountId: accountSenderId2
                        };
                    }),
                    accountMethods.approveAccount('approve receiver account 2', context => {
                        return {
                            accountId: accountReceiverId2
                        };
                    }),
                    commonFunc.createStep('ledger.account.edit', 'edit sender account 2', context => {
                        return {
                            account: {
                                accountId: accountSenderId2,
                                accountName: ACCOUNTNAME + 3,
                                accountNumber: accountSenderNumber2,
                                ownerId: customerActorId1,
                                productId: context['add first product'].product[0].productId,
                                businessUnitId: orgId1
                            },
                            accountPerson: {
                                accountId: accountSenderId2,
                                personId: customerActorId1
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + 3, 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    commonFunc.createStep('ledger.account.edit', 'edit receiver account 2', context => {
                        return {
                            account: {
                                accountId: accountReceiverId2,
                                accountName: ACCOUNTNAME + 4,
                                accountNumber: accountReceiverNumber2,
                                ownerId: customerActorId2,
                                productId: context['add second product'].product[0].productId,
                                businessUnitId: orgId1
                            },
                            accountPerson: {
                                accountId: accountReceiverId2,
                                personId: customerActorId2
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + 4, 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 13', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 8',
                        context => [accountSenderId1,
                            accountSenderId2,
                            accountReceiverId1,
                            accountReceiverId2,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - destination account in status pending', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber2
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTSTATUSFAILURE, 'Account status does not allow transactions.');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - destination account in status pending', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber2,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 24,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTSTATUSFAILURE, 'Account status does not allow transactions.');
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - source account in status pending', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber2
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - source account in status pending', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber2,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 25,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    userMethods.logout('logout user 13', context => context['login user 13']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances are unchanged in all accounts
                    accountMethods.getAccountBalance('get sender account balance 12', context => accountSenderId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get receiver account balance 12', context => accountReceiverId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 12', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 12', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 12', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.rejectAccount('reject sender account 2', context => accountSenderId2),
                    accountMethods.rejectAccount('reject receiver account 2', context => accountReceiverId2),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 14', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 9',
                        context => [accountSenderId1,
                            accountSenderId2,
                            accountReceiverId1,
                            accountReceiverId2,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - destination account in status rejected', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber2
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTSTATUSFAILURE, 'Account status does not allow transactions.');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - destination account in status rejected', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber2,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 26,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTSTATUSFAILURE, 'Account status does not allow transactions.');
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - source account in status rejected', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber2
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - source account in status rejected', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber2,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 27,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    userMethods.logout('logout user 14', context => context['login user 14']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances are unchanged in all accounts
                    accountMethods.getAccountBalance('get sender account balance 13', context => accountSenderId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get receiver account balance 13', context => accountReceiverId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 13', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 13', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 13', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.discardAccount('discard changes customer 1 accounts', context => {
                        return {
                            ownerId: customerActorId1
                        };
                    }),
                    accountMethods.discardAccount('discard changes customer 2 accounts', context => {
                        return {
                            ownerId: customerActorId2
                        };
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 15', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 10',
                        context => [accountSenderId1,
                            accountReceiverId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    /** Wallet-to-wallet transaction - by accountNumber and msisdn */
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction - destinationAccount accountNumber', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1 },
                            transferIdAcquirer: TRANSFERIDACQUIRER + 28,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + 2, 'return correct destination account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                    }),
                    userMethods.logout('logout user 15', context => context['login user 15']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 14', context => accountSenderId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get receiver account balance 14', context => accountReceiverId1, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 14', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 14', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 14', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    // Edit default customer account - change product
                    commonFunc.createStep('ledger.account.edit', 'edit default account of receiver', context => {
                        return {
                            account: {
                                accountId: context['fetch default receiver account'].account[0].accountId,
                                accountName: ACCOUNTNAME + '5',
                                accountNumber: context['fetch default receiver account'].account[0].accountNumber,
                                ownerId: customerActorId2,
                                productId: context['add second product'].product[0].productId,
                                businessUnitId: orgId1
                            },
                            accountPerson: {
                                accountId: context['fetch default receiver account'].account[0].accountId,
                                personId: customerActorId2,
                                isDefault: 1
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + '5', 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    accountMethods.approveAccount('approve edit of default receiver account', context => {
                        return {
                            accountId: context['fetch default receiver account'].account[0].accountId
                        };
                    }),
                    commonFunc.createStep('ledger.userAccountByPhoneNumber.get', 'get default account of customer 2 by phone number', context => {
                        return {
                            phoneNumber: PHONENUMBER + '2'
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateGetUserAccountByPhoneNumber(result).error, null, 'return correct details for customer accounts by phone number');
                        assert.true(result.customerAccount.some(account => account.accountName === ACCOUNTNAME + '5'), 'return default account');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 16', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 11',
                        context => [accountSenderId1,
                            context['fetch default receiver account'].account[0].accountId,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    // wallet-to-wallet transaction by MSISDN - uses the default account of the customer, the one created during the self-register process
                    commonFunc.createStep('transaction.validate', 'successfully validate wallet-to-wallet transaction - destinationAccount msisdn', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: {
                                type: transferConstants.MSISDN,
                                value: PHONENUMBER + '2'},
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + '5', 'return correct destination account name - default account');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction - destinationAccount msisdn', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: {
                                type: transferConstants.MSISDN,
                                value: PHONENUMBER + '2'},
                            transferIdAcquirer: TRANSFERIDACQUIRER + 29,
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountName, ACCOUNTNAME + '5', 'return correct destination account name - default account');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 29, 'return correct transferIdAcquirer');
                    }),
                    commonFunc.createStep('transaction.validate', 'unsuccessfully validate wallet-to-wallet transaction - destinationAccount msisdn nonexisting', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: {
                                type: transferConstants.MSISDN,
                                value: PHONENUMBER + '2a'},
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - destinationAccount msisdn', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: {
                                type: transferConstants.MSISDN,
                                value: PHONENUMBER + '2a'},
                            transferIdAcquirer: TRANSFERIDACQUIRER + '29a',
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found');
                    }),
                    userMethods.logout('logout user 16', context => context['login user 16']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 15', context => accountSenderId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get default account balance 15', context => context['fetch default receiver account'].account[0].accountId, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 15', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 15', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 15', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 17', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 12',
                        context => [accountSenderId1,
                            accountReceiverId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - destination account non-existing', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: NONEXISTINGACCOUNT,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 30,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'transfer.noSplitsWereFound', 'No splits were found');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - source account does not belong to the logged user', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountReceiverNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 31,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - missing permission');
                    }),
                    /** Negative scenarios - missing or invalid fields */
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - negative amount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNTNEGATIVE,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber1
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber1
                            },
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure - negative amount is not allowed');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - negative amount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNTNEGATIVE,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 33,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure - negative amount is not allowed');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - transferType missing', (context) => {
                        return {
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 34,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - transferType null', (context) => {
                        return {
                            transferType: null,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 35,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - transferType empty string', (context) => {
                        return {
                            transferType: '',
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 36,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - invalid transferType', (context) => {
                        return {
                            transferType: INVALIDSTRING,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 37,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - amount missing', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 38,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - amount null', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: null,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 39,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - amount empty string', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: '',
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 40,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - amount string', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: INVALIDSTRING,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 41,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - missing transferIdAcquirer', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - null transferIdAcquirer', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: null,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - empty string transferIdAcquirer', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: '',
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - missing sourceAccount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: INVALIDSTRING,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 42,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - null sourceAccount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: INVALIDSTRING,
                            sourceAccount: null,
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 43,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - empty string sourceAccount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: INVALIDSTRING,
                            sourceAccount: '',
                            destinationAccount: accountReceiverNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 44,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - missing destinationAccount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: INVALIDSTRING,
                            sourceAccount: accountSenderNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 45,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - null destinationAccount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: INVALIDSTRING,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: null,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 46,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute wallet-to-wallet transaction - empty string destinationAccount', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: INVALIDSTRING,
                            sourceAccount: accountSenderNumber1,
                            destinationAccount: '',
                            transferIdAcquirer: TRANSFERIDACQUIRER + 47,
                            description: operationNameWalletToWallet
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    userMethods.logout('logout user 17', context => context['login user 17']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get sender account balance 16', context => accountSenderId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get receiver account balance 16', context => accountReceiverId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 16', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 16', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 16', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 18', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    /** Reversal scenarios */
                    transferMethods.setBalance('set default balance in all accounts 13',
                        context => [accountSenderId2,
                            accountReceiverId2,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction - to be reversed', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber2,
                            destinationAccount: accountReceiverNumber2,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 'reverse',
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                    }),
                    userMethods.logout('logout user 18', context => context['login user 18']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('ledger.account.edit', 'edit sender account 2', context => {
                        return {
                            account: {
                                accountId: accountSenderId2,
                                accountName: ACCOUNTNAME + 3,
                                accountNumber: accountSenderNumber2,
                                ownerId: customerActorId1,
                                productId: context['add first product'].product[0].productId,
                                businessUnitId: orgId1
                            },
                            accountPerson: {
                                accountId: accountSenderId2,
                                personId: customerActorId1
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + 3, 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 1', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.reverse.execute', 'unsuccessfully reverse transaction - source account in status pending', (context) => {
                        return {
                            transferId: context['successfully execute wallet-to-wallet transaction - to be reversed'].transferId
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTSTATUSFAILURE, 'Account status does not allow transactions.');
                    }),
                    userMethods.logout('logout teller 1', context => context['login teller 1']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.approveAccount('approve edit of sender account 2', context => {
                        return {
                            accountId: accountSenderId2
                        };
                    }),
                    commonFunc.createStep('ledger.account.edit', 'edit receiver account 2', context => {
                        return {
                            account: {
                                accountId: accountReceiverId2,
                                accountName: ACCOUNTNAME + 4,
                                accountNumber: accountReceiverNumber2,
                                ownerId: customerActorId2,
                                productId: context['add second product'].product[0].productId,
                                businessUnitId: orgId1
                            },
                            accountPerson: {
                                accountId: accountReceiverId2,
                                personId: customerActorId2
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + 4, 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 2', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.reverse.execute', 'unsuccessfully reverse transaction - destination account in status pending', (context) => {
                        return {
                            transferId: context['successfully execute wallet-to-wallet transaction - to be reversed'].transferId
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTSTATUSFAILURE, 'Account status does not allow transactions.');
                    }),
                    userMethods.logout('logout teller 2', context => context['login teller 2']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.approveAccount('approve edit of receiver account 2', context => {
                        return {
                            accountId: accountReceiverId2
                        };
                    }),
                    accountMethods.getAccountBalance('get sender account balance 17', context => accountSenderId2, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get receiver account balance 17', context => accountReceiverId2, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 17', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 17', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 17', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 3', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set balance in sender account > product MAXACCOUNTBALANCE - REVERSALAMOUNTSENDER',
                        context => [accountSenderId2], commonFunc.roundNumber(MAXACCOUNTBALANCE - REVERSALAMOUNTSENDER + SMALLESTNUM, PRECISION)),
                    commonFunc.createStep('transaction.reverse.execute', 'unsuccessfully reverse transaction - source account balance exceeding product MAXACCOUNTBALANCE', (context) => {
                        return {
                            transferId: context['successfully execute wallet-to-wallet transaction - to be reversed'].transferId
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Account balance does not meet product limits.');
                    }),
                    transferMethods.setBalance('set balance in receiver account < product MINACCOUNTBALANCE + REVERSALAMOUNTRECEIVER',
                        context => [accountReceiverId2], commonFunc.roundNumber(MINACCOUNTBALANCE + REVERSALAMOUNTRECEIVER - SMALLESTNUM, PRECISION)),
                    commonFunc.createStep('transaction.reverse.execute', 'unsuccessfully reverse transaction - source account balance exceeding product MAXACCOUNTBALANCE', (context) => {
                        return {
                            transferId: context['successfully execute wallet-to-wallet transaction - to be reversed'].transferId
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Account balance does not meet product limits.');
                    }),
                    userMethods.logout('logout teller 3', context => context['login teller 3']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get fee account balance 18', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 18', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 18', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 19', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 13',
                        context => [accountSenderId2,
                            accountReceiverId2,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute wallet-to-wallet transaction - to be reversed 1', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber2,
                            destinationAccount: accountReceiverNumber2,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 'reverse1',
                            description: operationNameWalletToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                    }),
                    userMethods.logout('logout user 19', context => context['login user 19']['identity.check'].sessionId),
                    userMethods.login('login teller 4', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.reverse.execute', 'successfully reverse transaction', (context) => {
                        return {
                            transferId: context['successfully execute wallet-to-wallet transaction - to be reversed 1'].transferId
                        };
                    }, (result, assert) => {
                        assert.equals(result.success, true, 'return successs');
                    }),
                    userMethods.logout('logout teller 4', context => context['login teller 4']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances in all accounts are as they were before the wallet-to-wallet transaction
                    accountMethods.getAccountBalance('get sender account balance 19', context => accountSenderId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get receiver account balance 19', context => accountReceiverId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 19', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 19', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 19', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    transferMethods.setBalance('set receiver account 2 balance to 0',
                        context => accountReceiverId2, 0),
                    accountMethods.closeAccount('close receiver account 2', context => accountReceiverId2),
                    accountMethods.approveAccount('approve closing of account', context => {
                        return {
                            accountId: accountReceiverId2
                        };
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 20', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - closed account', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountSenderNumber2
                            },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountReceiverNumber2
                            }
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTSTATUSFAILURE, 'Account status does not allow transactions.');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute transaction - closed account', (context) => {
                        return {
                            transferType: operationeCodeWalletToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountSenderNumber2,
                            destinationAccount: accountReceiverNumber2,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 48
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTSTATUSFAILURE, 'Account status does not allow transactions.');
                    })
                    /** TODO Scenarios for state - transactions cannot be processed for account in state Blocked */
                ])
            );
        }
    }, cache);
};
