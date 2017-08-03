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
const PHONENUMBER = customerConstants.PHONENUMBER.slice(3);
const LINKEDACCOUNT = '3148324032';
const NONEXISTINGACCOUNT = 'testaccount';
const IMEI1 = (Math.floor(100000000000000 + Math.random() * 999999999999999)).toString();
// Rule parameters
const BANKACCOUNTTOWALLETPERCENT = 100;
const TRANSACTIONFEE = 10.50;
const TRANSACTIONFEEPERCENT = 100;
const TRANSACTIONFEEVALUE = TRANSACTIONFEE * TRANSACTIONFEEPERCENT / 100;
const FEETOVATPERCENT = 9;
const FEETOVATVALUE = TRANSACTIONFEE * FEETOVATPERCENT / 100;
const FEETOOTHERTAXPERCENT = 19;
const FEETOOTHERTAXVALUE = TRANSACTIONFEE * FEETOOTHERTAXPERCENT / 100;
// Balance parameters
const MINACCOUNTBALANCE = 200;
const MAXACCOUNTBALANCE = 10000;
const PRECISION = transferConstants.PRECISION;
var SMALLESTNUM = transferConstants.SMALLESTNUM;
const MINACCOUNTOPENINGBALANCE = 200;
const DEFAULTCREDIT = 2000;
const TRANSFERAMOUNT = 200;
const ACCOUNTNAME = accountConstants.ACCOUNTNAME;
var conditionId, orgId1, organizationDepthArray;
var currencyName1, priority;
var operationIdLinkedAccountToWallet, operationCodeLinkedAccountToWallet, operationNameLinkedAccountToWallet;
var customerTypeIndividual, customerActorId, customerActorId2, currencyId, category1, category2, productType, productTypeId, periodicFeeId, productGroup, productGroupId, roleMobileClientId, roleTellerId;
var accountId1, accountNumber1;
var stdPolicy;

module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'pull funds from linked bank account',
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
                accountMethods.disableAccountMCH('enable account M/C', context => {}, 0),
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
                    var operationLinkedAccountToWallet = result.itemTranslationFetch.find(item => item.itemCode === transferConstants.LINKEDACCOUNTTOWALLET);
                    operationIdLinkedAccountToWallet = operationLinkedAccountToWallet.itemNameId;
                    operationCodeLinkedAccountToWallet = operationLinkedAccountToWallet.itemCode;
                    operationNameLinkedAccountToWallet = operationLinkedAccountToWallet.itemName;
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
                    commonFunc.createStep('customer.selfregister', 'self register customer', (context) => {
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
                        customerActorId = result.actorId;
                        assert.equals(result.success, true, 'return success: true');
                    }),
                    commonFunc.createStep('ledger.account.fetch', 'fetch default customer account', context => {
                        return {
                            filterBy: {
                                ownerId: customerActorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateFetchAccount(result.account).error, null, 'Return all details after fetching account');
                        productGroup = result.account[0].productGroup;
                        productType = result.account[0].productType;
                    }),
                    commonFunc.createStep('customer.selfregister', 'self register customer 2', (context) => {
                        return {
                            uri: customerConstants.SELFREGURI,
                            firstName: customerConstants.FIRSTNAME + 'linked',
                            lastName: customerConstants.LASTNAME,
                            dateOfBirth: customerConstants.DATEOFBIRTH,
                            gender: customerConstants.GENDERM,
                            phoneNumber: PHONENUMBER + 1,
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
                    commonFunc.createStep('user.user.get', 'get user details', (context) => {
                        return {
                            actorId: customerActorId
                        };
                    }, (result, assert) => {
                        assert.equals(customerJoiValidation.validateGetPerson(result.person, customerConstants.FIRSTNAME).error, null, 'return person');
                        assert.equals(result['user.hash'][0].identifier, PHONENUMBER, 'return username = customer phone number in user.hash');
                        roleMobileClientId = result.rolesPossibleForAssign.find(role => role.name === transferConstants.MOBILECLIENT && role.isAssigned === 1).roleId;
                        roleTellerId = result.rolesPossibleForAssign.find(role => role.name === transferConstants.TELLER).roleId;
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
                        productTypeId = result.productType.find(type => type.name === productType).productTypeId;
                    }),
                    commonFunc.createStep('ledger.productPeriodicFee.fetch', 'fetch product periodic fee', (context) => {
                        return {};
                    }, (result, assert) => {
                        periodicFeeId = result.periodicFee[0].periodicFeeId;
                    }),
                    commonFunc.createStep('ledger.product.add', 'add product', (context) => productParams.addProductParams(context, (context) => {
                        return {
                            customerTypeId: customerTypeIndividual,
                            businessUnitId: orgId1,
                            currencyId: currencyId,
                            startDate: productConstants.STARTDATE,
                            endDate: productConstants.ENDDATE,
                            minAccountBalance: MINACCOUNTBALANCE,
                            maxAccountBalance: MAXACCOUNTBALANCE,
                            minAccountOpeningBalance: MINACCOUNTOPENINGBALANCE,
                            kyc: [context['add kyc 1'].kyc[0].kycId],
                            customerCategory: [category1, category2],
                            productTypeId: productTypeId,
                            periodicFeeId: periodicFeeId
                        };
                    }, productConstants.PRODUCTNAME + 1),
                    (result, assert) => {
                        assert.equals(productJoiValidation.validateAddProduct(result).error, null, 'Return all details after adding a product');
                        assert.equals(result.product[0].name, productConstants.PRODUCTNAME + 1, 'return product name');
                    }),
                    productMethods.getProduct('get product 1', (context) => context['add product'].product[0].productId),
                    productMethods.approveProduct('approve product', context => {
                        return {
                            productId: context['add product'].product[0].productId,
                            currentVersion: context['get product 1'].product[0].currentVersion
                        };
                    }),
                    productMethods.getProduct('get product 2', (context) => context['add product'].product[0].productId),
                    // Accounts setup
                    commonFunc.createStep('ledger.account.add', 'add account 1', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customerActorId,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME,
                                linkedAccount: LINKEDACCOUNT
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: customerActorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                        accountId1 = result.account[0].accountId;
                        accountNumber1 = result.account[0].accountNumber;
                    }),
                    accountMethods.approveAccount('approve adding of account 1', context => {
                        return {
                            accountId: accountId1
                        };
                    }),
                    commonFunc.createStep('ledger.account.add', 'add account 2 - without linked account', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customerActorId,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME + 2
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: customerActorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                    }),
                    accountMethods.approveAccount('approve adding of account 2', context => {
                        return {
                            accountId: context['add account 2 - without linked account'].account[0].accountId
                        };
                    }),
                    commonFunc.createStep('ledger.account.add', 'add account 3', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customerActorId,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME + 3
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: customerActorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                    }),
                    commonFunc.createStep('ledger.account.add', 'add account 4 - second customer', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customerActorId2,
                                productId: context['add product'].product[0].productId,
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
                    }),
                    accountMethods.approveAccount('approve adding of account 4', context => {
                        return {
                            accountId: context['add account 4 - second customer'].account[0].accountId
                        };
                    }),
                    accountMethods.fetchAccount('fetch fee account id', context => {
                        return {
                            accountNumber: opt.feeLinkedBankAccountToWallet
                        };
                    }),
                    accountMethods.fetchAccount('fetch vat account id', context => {
                        return {
                            accountNumber: opt.vatLinkedBankAccountToWallet
                        };
                    }),
                    accountMethods.fetchAccount('fetch otherTax account id', context => {
                        return {
                            accountNumber: opt.otherTaxLinkedBankAccountToWallet
                        };
                    }),
                    /** RULE SETUP
                     * @conditionItem @conditionActor - used to define permissions for the transaction (which role, product, transaction type)
                     * @splitRange - defines the amount which will be splitted between the different accounts.
                     * The split range amount may be defined as "percent" (percent of the transaction amount) OR minValue(amount which is not calculated from the transaction amount)
                     * @splitAssignment - defines the way in which the amount in the split range will be splitted between the different accounts.
                     */
                    commonFunc.createStep('db/rule.rule.add', 'add rule pull funds from linked bank account', (context) => {
                        return {
                            condition: {
                                priority: priority - 1
                            },
                            conditionItem: [{
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdLinkedAccountToWallet
                            }, {
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Pull funds from linked account',
                                            tag: ruleConstants.ISSUERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: BANKACCOUNTTOWALLETPERCENT, // 100 % of the amount defined in transaction.execute
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            // Pulls funds from the customer's bank account and sends them to the customer's wallet account.
                                            // The sent amount is percent(BANKACCOUNTTOWALLETPERCENT) of the transferred amount defined in transaction.execute
                                            debit: ruleConstants.SOURCEACCOUNTIDLINKED,
                                            credit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            percent: BANKACCOUNTTOWALLETPERCENT, // 100%
                                            description: 'Transfer amount',
                                            splitAnalytic: {
                                                name: 'linkedAccount',
                                                value: 'debit'
                                            }
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Pull funds from linked account - Fee',
                                            tag: ruleConstants.ISSUERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            // Pulls funds from the customer wallet account and sends them to the GL fee account.
                                            // The sent amount is percent of the amount defined in the split range (TRANSACTIONFEEPERCENT * TRANSACTIONFEE / 100)
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeLinkedBankAccountToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Fee - pull from linked account'
                                        }, {
                                            // Pulls funds from the GL fee account and sends them to the GL VAT account.
                                            // The sent amount is percent of the amount defined in the split range (FEETOVATPERCENT * TRANSACTIONFEE / 100)
                                            debit: opt.feeLinkedBankAccountToWallet,
                                            credit: opt.vatLinkedBankAccountToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT - pull from linked account',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            // Pulls funds from the GL fee account and sends them to the GL other tax account.
                                            // The sent amount is percent of the amount defined in the split range (FEETOOTHERTAXPERCENT * TRANSACTIONFEE / 100)
                                            debit: opt.feeLinkedBankAccountToWallet,
                                            credit: opt.otherTaxLinkedBankAccountToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Tax - pull from linked account',
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
                    commonFunc.createStep('identity.check', 'login customer 1', (context) => {
                        return {
                            username: PHONENUMBER,
                            password: context['self register customer'].token,
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
                            channelId: context['self register customer'].actorId,
                            operation: operationCodeLinkedAccountToWallet,
                            sourceAccount: accountNumber1,
                            destinationAccount: accountNumber1,
                            amount: TRANSFERAMOUNT,
                            currency: currencyName1
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateDecisionLookup(result).error, null, 'Return all detals after decision lookup');
                        assert.true(result.split.every(split => split.conditionId === conditionId), 'return correct conditionId');
                    }),
                    /** Scenarios for product which is with min and max account balance */
                    transferMethods.setBalance('set wallet account balance more than product max account balance - transfer amount + transaction fee',
                        context => [accountId1], commonFunc.roundNumber(MAXACCOUNTBALANCE - TRANSFERAMOUNT + TRANSACTIONFEE + SMALLESTNUM, PRECISION)),
                    transferMethods.setBalance('set default balance in fee, vat and otherTax accounts',
                        context => [context['add account 2 - without linked account'].account[0].accountId,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - insufficient balance in wallet account', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'return failure - wallet balance more than product max account balance');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute linkedBank-to-wallet transaction - insufficient balance in wallet account', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 1
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'return failure - wallet balance more than product max account balance');
                    }),
                    transferMethods.setBalance('set wallet account balance more than product max account balance - transfer amount + transaction fee',
                        context => [accountId1], commonFunc.roundNumber(MAXACCOUNTBALANCE - TRANSFERAMOUNT + TRANSACTIONFEE, PRECISION)),
                    commonFunc.createStep('transaction.validate', 'successful transaction validation - minimum sufficient balance in wallet account', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            description: operationNameLinkedAccountToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountNumber1, 'return correct wallet account number');
                        assert.equals(result.destinationAccount.accountNumber, LINKEDACCOUNT, 'return correct linked account number');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferType, operationCodeLinkedAccountToWallet, 'return correct transferType');
                        assert.equals(result.description, operationNameLinkedAccountToWallet, 'return correct description');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute linkedBank-to-wallet transaction - minimum sufficient balance in wallet account', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 2,
                            description: operationNameLinkedAccountToWallet
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 2, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationCodeLinkedAccountToWallet, 'return correct transferType');
                    }),
                    /**  Negative scеnario - when there is no bank account linked to the wallet account */
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - no linked account for the wallet account', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: context['add account 2 - without linked account'].account[0].accountNumber
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - linked account not found');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute linkedBank-to-wallet transaction - no linked account for the wallet account', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: context['add account 2 - without linked account'].account[0].accountNumber,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 3
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - linked account not found');
                    }),
                    userMethods.logout('logout customer 1', context => context['login customer 1']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get wallet account balance 1', context => accountId1, MAXACCOUNTBALANCE),
                    accountMethods.getAccountBalance('get fee account balance 1', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 1', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 1', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    transferMethods.setBalance('set default balance in all accounts',
                        context => [context['add account 3'].account[0].accountId,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login customer 2', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    /** Scenarios with status and state */
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - wallet account in status new', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: context['add account 3'].account[0].accountNumber
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found, status new');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute linkedBank-to-wallet transaction - wallet account in status new', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: context['add account 3'].account[0].accountNumber,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 4
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found, status new');
                    }),
                    userMethods.logout('logout customer 2', context => context['login customer 2']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.approveAccount('approve adding of account 3', context => {
                        return {
                            accountId: context['add account 3'].account[0].accountId
                        };
                    }),
                    commonFunc.createStep('ledger.account.edit', 'edit account 3', context => {
                        return {
                            account: {
                                accountId: context['add account 3'].account[0].accountId,
                                accountName: ACCOUNTNAME + '3update',
                                accountNumber: context['add account 3'].account[0].accountNumber,
                                ownerId: customerActorId,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1,
                                linkedAccount: LINKEDACCOUNT
                            },
                            accountPerson: {
                                accountId: context['add account 3'].account[0].accountId,
                                personId: customerActorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + '3update', 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login customer 3', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in account 3',
                        context => [context['add account 3'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - wallet account in status pending', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: context['add account 3'].account[0].accountNumber
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account pending');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute linkedBank-to-wallet transaction - wallet account in status pending', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: context['add account 3'].account[0].accountNumber,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 5
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account pending');
                    }),
                    userMethods.logout('logout customer 3', context => context['login customer 3']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get wallet account balance 2', context => context['add account 3'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 2', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 2', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 2', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.rejectAccount('reject edit of account 3', context => context['add account 3'].account[0].accountId),
                    accountMethods.discardAccount('discard changes in account 3', context => {
                        return {
                            ownerId: customerActorId
                        };
                    }),
                    transferMethods.setBalance('set zero balance in account 3',
                        context => [context['add account 3'].account[0].accountId], 0),
                    transferMethods.setBalance('set default balance in GL accounts',
                        context => [context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    accountMethods.closeAccount('close account 3', context => context['add account 3'].account[0].accountId),
                    accountMethods.approveAccount('approve closing of account 3', context => {
                        return {
                            accountId: context['add account 3'].account[0].accountId
                        };
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login customer 4', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - wallet account closed', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: context['add account 3'].account[0].accountNumber
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account closed');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute linkedBank-to-wallet transaction - wallet account closed', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: context['add account 3'].account[0].accountNumber,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 6
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account closed');
                    }),
                    userMethods.logout('logout customer 4', context => context['login customer 4']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get fee account balance 3', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 3', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 3', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    /** Rule limit scenario */
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add minAmount limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdLinkedAccountToWallet
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }],
                            limit: [{
                                conditionId: conditionId,
                                currency: currencyName1,
                                minAmount: TRANSFERAMOUNT
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Pull funds from linked account',
                                            tag: ruleConstants.ISSUERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: BANKACCOUNTTOWALLETPERCENT,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTIDLINKED,
                                            credit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            percent: BANKACCOUNTTOWALLETPERCENT, // 100%
                                            description: 'Transfer amount',
                                            splitAnalytic: {
                                                name: 'linkedAccount',
                                                value: 'debit'
                                            }
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Pull funds from linked account - Fee',
                                            tag: ruleConstants.ISSUERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeLinkedBankAccountToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Fee - pull from linked account'
                                        }, {
                                            debit: opt.feeLinkedBankAccountToWallet,
                                            credit: opt.vatLinkedBankAccountToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT - pull from linked account',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeLinkedBankAccountToWallet,
                                            credit: opt.otherTaxLinkedBankAccountToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Tax - pull from linked account',
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
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after add rule');
                        assert.equals(result.limit[0].minAmount, TRANSFERAMOUNT, 'return correct minAmount limit');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login customer 5', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts',
                        context => [accountId1, context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - transfer amount less than rule minAmount limit', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: accountNumber1
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MINLIMITAMOUNTERROR, 'return failure - rule min limit exceeded');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute linkedBank-to-wallet transaction - transfer amount less than rule minAmount limit', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 7
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MINLIMITAMOUNTERROR, 'return failure - rule min limit exceeded');
                    }),
                    userMethods.logout('logout customer 5', context => context['login customer 5']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get wallet account balance 4', context => accountId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 4', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 4', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 4', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - aremove limits', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdLinkedAccountToWallet
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Pull funds from linked account',
                                            tag: ruleConstants.ISSUERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: BANKACCOUNTTOWALLETPERCENT,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTIDLINKED,
                                            credit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            percent: BANKACCOUNTTOWALLETPERCENT, // 100%
                                            description: 'Transfer amount',
                                            splitAnalytic: {
                                                name: 'linkedAccount',
                                                value: 'debit'
                                            }
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Pull funds from linked account - Fee',
                                            tag: ruleConstants.ISSUERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeLinkedBankAccountToWallet,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Fee - pull from linked account'
                                        }, {
                                            debit: opt.feeLinkedBankAccountToWallet,
                                            credit: opt.vatLinkedBankAccountToWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT - pull from linked account',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeLinkedBankAccountToWallet,
                                            credit: opt.otherTaxLinkedBankAccountToWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Tax - pull from linked account',
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
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after add rule');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login customer 6', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    /** Reversal scenarios */
                    transferMethods.setBalance('set default balance in all accounts',
                        context => [accountId1, context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute linkedBank-to-wallet transaction - to be reversed', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 8
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                    }),
                    userMethods.logout('logout customer 6', context => context['login customer 6']['identity.check'].sessionId),
                    userMethods.login('login teller', userConstants.USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                    commonFunc.createStep('transaction.reverse.execute', 'unsuccessfully reverse transaction - not reversible transaction', (context) => {
                        return {
                            transferId: context['successfully execute linkedBank-to-wallet transaction - to be reversed'].transferId
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.UNSUPPORTEDREVERSETYPEERROR, 'return failure - unsupported reverse type');
                    }),
                    userMethods.logout('logout teller', context => context['login teller']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the transaction is not reversed
                    accountMethods.getAccountBalance('get wallet account balance 5', context => accountId1, DEFAULTCREDIT + TRANSFERAMOUNT - TRANSACTIONFEEVALUE),
                    accountMethods.getAccountBalance('get fee account balance 5', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 5', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 5', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login customer 7', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts',
                        context => [context['add account 4 - second customer'].account[0].accountId,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - account which does not belong to the customer', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: context['add account 4 - second customer'].account[0].accountNumber
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - missing permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute linkedBank-to-wallet transaction - account which does not belong to the customer', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: context['add account 4 - second customer'].account[0].accountNumber,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 9
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - missing permission');
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - nonexisting wallet account', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: NONEXISTINGACCOUNT
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute linkedBank-to-wallet transaction - nonexisting wallet account', (context) => {
                        return {
                            transferType: operationCodeLinkedAccountToWallet,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: NONEXISTINGACCOUNT,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 10
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found');
                    }),
                    userMethods.logout('logout customer 7', context => context['login customer 7']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get wallet account balance 6', context => context['add account 4 - second customer'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 6', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 6', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 6', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT)
                ])
            );
        }
    }, cache);
};
