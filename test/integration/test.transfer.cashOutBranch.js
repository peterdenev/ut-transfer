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
// Rule parameters
const ACCOUNTTOBRANCHPERCENT = 100;
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
var successfulTransactionsCount = 0;
const MINACCOUNTOPENINGBALANCE = 200;
const DEFAULTCREDIT = 2000;
const TRANSFERAMOUNT = 200;
const ACCOUNTNAME = accountConstants.ACCOUNTNAME;
var conditionId, orgId1, organizationDepthArray;
var currencyName1, priority;
var operationIdCashOutBranch, operationeCodeCashOutBranch, operationNameCashOutBranch;
var customerTypeIndividual, customerActorId, currencyId, category1, category2, productType, productTypeId, periodicFeeId, productGroup, productGroupId, roleTellerId;
var accountId1, accountId2, accountNumber1, accountNumber2;
var stdPolicy;

// Wallet customer withdraws money from his/her wallet by visiting a branch
module.exports = function(opt) {
    return {
        type: 'integration',
        name: 'cash out at branch transaction',
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
                    var operationBalanceCheck = result.itemTranslationFetch.find(item => item.itemCode === transferConstants.CASHOUTBRANCH);
                    operationIdCashOutBranch = operationBalanceCheck.itemNameId;
                    operationeCodeCashOutBranch = operationBalanceCheck.itemCode;
                    operationNameCashOutBranch = operationBalanceCheck.itemName;
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
                        // console.log(result);
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
                    commonFunc.createStep('user.user.get', 'get user details', (context) => {
                        return {
                            actorId: customerActorId
                        };
                    }, (result, assert) => {
                        assert.equals(customerJoiValidation.validateGetPerson(result.person, customerConstants.FIRSTNAME).error, null, 'return person');
                        assert.equals(result['user.hash'][0].identifier, PHONENUMBER, 'return username = customer phone number in user.hash');
                        roleTellerId = result.rolesPossibleForAssign.find(role => role.name === transferConstants.TELLER).roleId;
                    }),
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
                    commonFunc.createStep('ledger.product.add', 'add product', (context) => productParams.addProductParams(context, (context) => {
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
                                accountName: ACCOUNTNAME
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
                    accountMethods.fetchAccount('fetch bank account id', context => {
                        return {
                            accountNumber: opt.bankAccount
                        };
                    }),
                    accountMethods.fetchAccount('fetch fee account id', context => {
                        return {
                            accountNumber: opt.feeCashOutBranch
                        };
                    }),
                    accountMethods.fetchAccount('fetch vat account id', context => {
                        return {
                            accountNumber: opt.vatCashOutBranch
                        };
                    }),
                    accountMethods.fetchAccount('fetch otherTax account id', context => {
                        return {
                            accountNumber: opt.otherTaxCashOutBranch
                        };
                    }),
                    /** RULE SETUP
                     * @conditionItem @conditionActor - used to define permissions for the transaction (which role, source product, transaction type)
                     * @splitRange - defines the amount which will be splitted between the different accounts.
                     * The split range amount may be defined as "percent" (percent of the transaction amount) OR minValue(amount which is not calculated from the transaction amount)
                     * @splitAssignment - defines the way in which the amount in the split range will be splitted between the different accounts.
                     */
                    commonFunc.createStep('db/rule.rule.add', 'add rule cash out at branch', (context) => {
                        return {
                            condition: {
                                priority: priority - 1
                            },
                            conditionItem: [{
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashOutBranch
                            }, {
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Transfer amount',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: 100, // 100 % of the amount defined in transaction.execute
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            // Pulls funds from the sender customer account and sends them to the bank account.
                                            // The sent amount is percent(ACCOUNTTOBRANCHPERCENT) of the transferred amount defined in transaction.execute
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.bankAccount,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            description: 'Transfer amount'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            // Pulls funds from the sender customer account and sends them to the GL fee account.
                                            // The sent amount is percent of the amount defined in the split range (TRANSACTIONFEEPERCENT * TRANSACTIONFEE / 100)
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashOutBranch,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: ruleConstants.FEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            // Pulls funds from the GL fee account and sends them to the GL VAT account.
                                            // The sent amount is percent of the amount defined in the split range (FEETOVATPERCENT * TRANSACTIONFEE / 100)
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.vatCashOutBranch,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            // Pulls funds from the GL fee account and sends them to the GL other tax account.
                                            // The sent amount is percent of the amount defined in the split range (FEETOOTHERTAXPERCENT * TRANSACTIONFEE / 100)
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.otherTaxCashOutBranch,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
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
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - missing permissions', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'Missing permissions for executing transaction');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully cash out at branch - missing permissions', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            sourceAccount: accountNumber1,
                            amount: TRANSFERAMOUNT,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 1,
                            description: operationNameCashOutBranch
                        };
                    }, null,
                        (error, assert) => {
                            assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'Missing permissions for executing transaction');
                        }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    commonFunc.createStep('identity.check', 'login user 1', (context) => {
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
                            operation: operationeCodeCashOutBranch,
                            sourceAccount: accountNumber1,
                            destinationAccount: accountNumber1,
                            amount: TRANSFERAMOUNT,
                            currency: currencyName1
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateDecisionLookup(result).error, null, 'Return all detals after decision lookup');
                        assert.true(result.split.every(split => split.conditionId === conditionId), 'return correct conditionId');
                    }),
                    userMethods.logout('logout user 1', context => context['login user 1']['identity.check'].sessionId),
                    userMethods.login('login teller 1', userConstants.USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                    /** Scenarios for product which is without min and max account balance */
                    transferMethods.setBalance('set customer account balance < TRANSFERAMOUNT',
                        context => [accountId1], commonFunc.roundNumber(TRANSFERAMOUNT + TRANSACTIONFEEVALUE - SMALLESTNUM, PRECISION)),
                    transferMethods.setBalance('set default balance in fee, vat and otherTax accounts',
                        context => [context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - insufficient balance in customer account', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Insufficient balance in customer account');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - insufficient balance in customer account', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 2,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Insufficient balance in customer account');
                    }),
                    transferMethods.setBalance('set customer account balance equal to TRANSFERAMOUNT',
                        context => [accountId1], TRANSFERAMOUNT + TRANSACTIONFEEVALUE),
                    commonFunc.createStep('transaction.execute', 'successfully execute cash-out-branch transaction - minimum sufficient balance in customer account', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 3,
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 3, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeCashOutBranch, 'return correct transferType');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout teller 1', context => context['login teller 1']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 1', context => accountId1, 0),
                    accountMethods.getAccountBalance('get fee account balance 1', context => context['fetch fee account id'].account[0].accountId, TRANSACTIONFEEVALUE + DEFAULTCREDIT - FEETOOTHERTAXVALUE - FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 1', context => context['fetch vat account id'].account[0].accountId, FEETOVATVALUE + DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 1', context => context['fetch otherTax account id'].account[0].accountId, FEETOOTHERTAXVALUE + DEFAULTCREDIT, PRECISION),
                     /** Scenarios with product which is with min and max account balance */
                    productMethods.editProduct('edit product - set min and max account balances', context => {
                        return {
                            productId: context['get product 2'].product[0].productId,
                            minAccountBalance: MINACCOUNTBALANCE,
                            maxAccountBalance: MAXACCOUNTBALANCE
                        };
                    }),
                    productMethods.getProduct('get product 3', (context) => context['add product'].product[0].productId),
                    productMethods.approveProduct('approve product after edit', context => {
                        return {
                            productId: context['add product'].product[0].productId,
                            currentVersion: context['get product 3'].product[0].currentVersion
                        };
                    }),
                    userMethods.logout('logout admin 1', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 2', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set customer account balance > MAXACCOUNTBALANCE + TRANSFERAMOUNT + TRANSACTIONFEEVALUE',
                        context => [accountId1], commonFunc.roundNumber(MAXACCOUNTBALANCE + TRANSFERAMOUNT + TRANSACTIONFEEVALUE + SMALLESTNUM, PRECISION)),
                    transferMethods.setBalance('set default balance in fee, vat and otherTax accounts',
                        context => [context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - customer balance exceeding product maxAccountBalance', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Account balance does not meet product limits.');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - customer balance exceeding product maxAccountBalance', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 4,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Account balance does not meet product limits.');
                    }),
                    transferMethods.setBalance('set customer account balance equal to MAXACCOUNTBALANCE + TRANSFERAMOUNT + TRANSACTIONFEEVALUE',
                        context => [accountId1], commonFunc.roundNumber(MAXACCOUNTBALANCE + TRANSFERAMOUNT + TRANSACTIONFEEVALUE, PRECISION)),
                    commonFunc.createStep('transaction.execute', 'successfully execute cash-out-branch transaction - customer balance within the product maxAccountBalance limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 5,
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 5, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeCashOutBranch, 'return correct transferType');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout teller 2', context => context['login teller 2']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 2', context => accountId1, MAXACCOUNTBALANCE, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 2', context => context['fetch fee account id'].account[0].accountId, TRANSACTIONFEEVALUE + DEFAULTCREDIT - FEETOOTHERTAXVALUE - FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 2', context => context['fetch vat account id'].account[0].accountId, FEETOVATVALUE + DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 2', context => context['fetch otherTax account id'].account[0].accountId, FEETOOTHERTAXVALUE + DEFAULTCREDIT, PRECISION),
                    userMethods.logout('logout admin 2', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 3', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set customer account balance < MINACCOUNTBALANCE + TRANSFERAMOUNT + TRANSACTIONFEEVALUE',
                        context => [accountId1], commonFunc.roundNumber(MINACCOUNTBALANCE + TRANSFERAMOUNT + TRANSACTIONFEEVALUE - SMALLESTNUM, PRECISION)),
                    transferMethods.setBalance('set default balance in fee, vat and otherTax accounts',
                        context => [context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - customer balance less than product minAccountBalance', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Account balance does not meet product limits.');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - customer balance less than product minAccountBalance', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 6,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Account balance does not meet product limits.');
                    }),
                    transferMethods.setBalance('set customer account balance equal to MAXACCOUNTBALANCE + TRANSFERAMOUNT + TRANSACTIONFEEVALUE',
                        context => [accountId1], commonFunc.roundNumber(MINACCOUNTBALANCE + TRANSFERAMOUNT + TRANSACTIONFEEVALUE, PRECISION)),
                    commonFunc.createStep('transaction.execute', 'successfully execute cash-out-branch transaction - customer balance within the product minAccountBalance limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 7,
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 7, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeCashOutBranch, 'return correct transferType');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout teller 3', context => context['login teller 3']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 3', context => accountId1, MINACCOUNTBALANCE),
                    accountMethods.getAccountBalance('get fee account balance 3', context => context['fetch fee account id'].account[0].accountId, TRANSACTIONFEEVALUE + DEFAULTCREDIT - FEETOOTHERTAXVALUE - FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 3', context => context['fetch vat account id'].account[0].accountId, FEETOVATVALUE + DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 3', context => context['fetch otherTax account id'].account[0].accountId, FEETOOTHERTAXVALUE + DEFAULTCREDIT, PRECISION),
                    /** Scenarios for rule limits - limits are applied to the source account, in this case the customer account */
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxCountDaily limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashOutBranch
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
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
                                            name: 'Transfer amount',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.bankAccount,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            description: 'Agent amount - Transfer'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashOutBranch,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: ruleConstants.FEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEEVALUE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.vatCashOutBranch,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.otherTaxCashOutBranch,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
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
                    userMethods.logout('logout admin 3', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 4', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - duplicate transferIdAcquirer', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 7,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSFERIDALREADYEXISTS, 'transferIdAcquirer must be unique');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute cash-out-branch transaction - within the limits of rule maxCountDaily transactions', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 8,
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 8, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeCashOutBranch, 'return correct transferType');
                        successfulTransactionsCount += 1;
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - exceeding the limits of rule maxCountDaily transactions', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.DAILYLIMITCOUNTERROR, 'daily transactions count limit reached');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - exceeding the limits of rule maxCountDaily transactions', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 9,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.DAILYLIMITCOUNTERROR, 'daily transactions count limit reached');
                    }),
                    userMethods.logout('logout teller 4', context => context['login teller 4']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 4', context => accountId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 4', context => context['fetch fee account id'].account[0].accountId, TRANSACTIONFEEVALUE + DEFAULTCREDIT - FEETOOTHERTAXVALUE - FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 4', context => context['fetch vat account id'].account[0].accountId, FEETOVATVALUE + DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 4', context => context['fetch otherTax account id'].account[0].accountId, FEETOOTHERTAXVALUE + DEFAULTCREDIT, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add minAmount, maxAmount limits', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashOutBranch
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
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
                                            name: 'Transfer amount',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.bankAccount,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            description: 'Agent amount - Transfer'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashOutBranch,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: ruleConstants.FEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEEVALUE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.vatCashOutBranch,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.otherTaxCashOutBranch,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
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
                    userMethods.logout('logout admin 4', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 5', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 1',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - amount less than rule minAmount limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MINLIMITAMOUNTERROR, 'Transaction amount is below minimum');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - amount less than rule minAmount limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 10,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MINLIMITAMOUNTERROR, 'Transaction amount is below minimum');
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - amount more than rule maxAmount limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MAXLIMITAMOUNTERROR, 'Transaction amount is above maximum');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - amount more than rule maxAmount limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 11,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MAXLIMITAMOUNTERROR, 'Transaction amount is above maximum');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute cash-out-branch transaction - within the limits of min and max amount', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 12,
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 12, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeCashOutBranch, 'return correct transferType');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout teller 5', context => context['login teller 5']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 5', context => accountId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 5', context => context['fetch fee account id'].account[0].accountId, TRANSACTIONFEEVALUE + DEFAULTCREDIT - FEETOOTHERTAXVALUE - FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 5', context => context['fetch vat account id'].account[0].accountId, FEETOVATVALUE + DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 5', context => context['fetch otherTax account id'].account[0].accountId, FEETOOTHERTAXVALUE + DEFAULTCREDIT, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxAmountDaily limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashOutBranch
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
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
                                            name: 'Transfer amount',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.bankAccount,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            description: 'Agent amount - Transfer'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashOutBranch,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: ruleConstants.FEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEEVALUE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.vatCashOutBranch,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.otherTaxCashOutBranch,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
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
                    userMethods.logout('logout admin 5', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 6', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 2',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - daily amount more than rule maxAmountDaily limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.DAILYLIMITAMOUNTERROR, 'Transaction amount is above maximum daily amount');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - daily amount more than rule maxAmountDaily limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 13,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.DAILYLIMITAMOUNTERROR, 'Transaction amount is above maximum daily amount');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute cash-out-branch transaction - within the limits of rule maxAmountDaily limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 14,
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 14, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeCashOutBranch, 'return correct transferType');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout teller 6', context => context['login teller 6']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 6', context => accountId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 6', context => context['fetch fee account id'].account[0].accountId, TRANSACTIONFEEVALUE + DEFAULTCREDIT - FEETOOTHERTAXVALUE - FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 6', context => context['fetch vat account id'].account[0].accountId, FEETOVATVALUE + DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 6', context => context['fetch otherTax account id'].account[0].accountId, FEETOOTHERTAXVALUE + DEFAULTCREDIT, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxAmountWeekly limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashOutBranch
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
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
                                            name: 'Transfer amount',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.bankAccount,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            description: 'Agent amount - Transfer'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashOutBranch,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: ruleConstants.FEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEEVALUE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.vatCashOutBranch,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.otherTaxCashOutBranch,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
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
                    userMethods.logout('logout admin 7', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 7', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 4',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - weekly amount more than rule maxAmountWeekly limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.WEEKLYLIMITAMOUNTERROR, 'Weekly transaction amount is above rule maximum weekly amount limit');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - weekly amount more than rule maxAmountWeekly limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 15,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.WEEKLYLIMITAMOUNTERROR, 'Weekly transaction amount is above rule maximum weekly amount limit');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute cash-out-branch transaction - within the limits of rule maxAmountWeekly limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 16,
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 16, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeCashOutBranch, 'return correct transferType');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout teller 7', context => context['login teller 7']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 7', context => accountId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 7', context => context['fetch fee account id'].account[0].accountId, TRANSACTIONFEEVALUE + DEFAULTCREDIT - FEETOOTHERTAXVALUE - FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 7', context => context['fetch vat account id'].account[0].accountId, FEETOVATVALUE + DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 7', context => context['fetch otherTax account id'].account[0].accountId, FEETOOTHERTAXVALUE + DEFAULTCREDIT, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxCountWeekly limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashOutBranch
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
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
                                            name: 'Transfer amount',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.bankAccount,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            description: 'Agent amount - Transfer'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashOutBranch,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: ruleConstants.FEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEEVALUE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.vatCashOutBranch,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.otherTaxCashOutBranch,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
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
                    userMethods.logout('logout admin 7', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 8', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 4',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute cash-out-branch transaction - within the limits of rule maxCountWeekly limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 17,
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 17, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeCashOutBranch, 'return correct transferType');
                        successfulTransactionsCount += 1;
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - rule maxCountWeekly limit already reached', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.WEEKLYLIMITCOUNTERROR, 'weekly transaction count limit reached');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - rule maxCountWeekly limit already reached', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 18,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.WEEKLYLIMITCOUNTERROR, 'weekly transaction count limit reached');
                    }),
                    userMethods.logout('logout teller 8', context => context['login teller 8']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 8', context => accountId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 8', context => context['fetch fee account id'].account[0].accountId, TRANSACTIONFEEVALUE + DEFAULTCREDIT - FEETOOTHERTAXVALUE - FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 8', context => context['fetch vat account id'].account[0].accountId, FEETOVATVALUE + DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 8', context => context['fetch otherTax account id'].account[0].accountId, FEETOOTHERTAXVALUE + DEFAULTCREDIT, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxAmountMonthly limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashOutBranch
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
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
                                            name: 'Transfer amount',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.bankAccount,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            description: 'Agent amount - Transfer'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashOutBranch,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: ruleConstants.FEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEEVALUE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.vatCashOutBranch,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.otherTaxCashOutBranch,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
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
                    userMethods.logout('logout admin 8', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 9', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 5',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - monthly amount more than rule maxAmountMonthly limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MONTHLYLIMITAMOUNTERROR, 'Monthly transaction amount is above rule maximum monthly amount limit');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - monthly amount more than rule maxAmountMonthly limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT + SMALLESTNUM,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 19,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MONTHLYLIMITAMOUNTERROR, 'Monthly transaction amount is above rule maximum monthly amount limit');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute cash-out-branch transaction - within the limits of rule maxAmountMonthly limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 20,
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 20, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeCashOutBranch, 'return correct transferType');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout teller 9', context => context['login teller 9']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 9', context => accountId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 9', context => context['fetch fee account id'].account[0].accountId, TRANSACTIONFEEVALUE + DEFAULTCREDIT - FEETOOTHERTAXVALUE - FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 9', context => context['fetch vat account id'].account[0].accountId, FEETOVATVALUE + DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 9', context => context['fetch otherTax account id'].account[0].accountId, FEETOOTHERTAXVALUE + DEFAULTCREDIT, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxCountMonthly limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashOutBranch
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
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
                                            name: 'Transfer amount',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.bankAccount,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            description: 'Agent amount - Transfer'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashOutBranch,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: ruleConstants.FEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEEVALUE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.vatCashOutBranch,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.otherTaxCashOutBranch,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
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
                    userMethods.logout('logout admin 9', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 10', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 6',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute cash-out-branch transaction - within the limits of rule maxCountMonthly limit', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 21,
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 21, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeCashOutBranch, 'return correct transferType');
                        successfulTransactionsCount += 1;
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - rule maxCountDaily limit already reached', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MONTHLYLIMITCOUNTERROR, 'monthly transaction count limit reached');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - rule maxCountDaily limit already reached', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 22,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MONTHLYLIMITCOUNTERROR, 'monthly transaction count limit reached');
                    }),
                    userMethods.logout('logout teller 10', context => context['login teller 10']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 10', context => accountId1, commonFunc.roundNumber(DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION)),
                    accountMethods.getAccountBalance('get fee account balance 10', context => context['fetch fee account id'].account[0].accountId, commonFunc.roundNumber(TRANSACTIONFEEVALUE + DEFAULTCREDIT - FEETOOTHERTAXVALUE - FEETOVATVALUE, PRECISION)),
                    accountMethods.getAccountBalance('get vat account balance 10', context => context['fetch vat account id'].account[0].accountId, commonFunc.roundNumber(FEETOVATVALUE + DEFAULTCREDIT, PRECISION)),
                    accountMethods.getAccountBalance('get otherTax account balance 10', context => context['fetch otherTax account id'].account[0].accountId, commonFunc.roundNumber(FEETOOTHERTAXVALUE + DEFAULTCREDIT, PRECISION)),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - remove limits', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashOutBranch
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Transfer amount',
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.bankAccount,
                                            percent: ACCOUNTTOBRANCHPERCENT,
                                            description: 'Agent amount - Transfer'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashOutBranch,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: ruleConstants.FEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEEVALUE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.vatCashOutBranch,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeCashOutBranch,
                                            credit: opt.otherTaxCashOutBranch,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
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
                    commonFunc.createStep('ledger.account.add', 'add account 2', context => {
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
                        accountId2 = result.account[0].accountId;
                        accountNumber2 = result.account[0].accountNumber;
                    }),
                    transferMethods.setBalance('set default balance in all accounts 7',
                        context => [context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    userMethods.logout('logout admin 10', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 11', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    /** Negative scenarios for status - transactions can be processed only for accounts in status approved */
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - source account in status new', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber2
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - source account in status new', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber2,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 23,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found');
                    }),
                    userMethods.logout('logout teller 11', context => context['login teller 11']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances are unchanged in all accounts
                    accountMethods.getAccountBalance('get customer account balance 11', context => accountId2, 0),
                    accountMethods.getAccountBalance('get fee account balance 11', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 11', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 11', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.approveAccount('approve account 2', context => {
                        return {
                            accountId: accountId2
                        };
                    }),
                    commonFunc.createStep('ledger.account.edit', 'edit account 2', context => {
                        return {
                            account: {
                                accountId: accountId2,
                                accountName: ACCOUNTNAME + '2',
                                accountNumber: accountNumber2,
                                ownerId: customerActorId,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1
                            },
                            accountPerson: {
                                accountId: accountId2,
                                personId: customerActorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + '2', 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    userMethods.logout('logout admin 11', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 12', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 8',
                        context => [accountId2,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - source account in status pending', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber2
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - source account in status pending', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber2,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 24,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    userMethods.logout('logout teller 12', context => context['login teller 12']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 12', context => accountId2, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 12', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 12', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 12', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.rejectAccount('reject account 2', context => accountId2),
                    userMethods.logout('logout admin 12', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 13', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 9',
                        context => [accountId2,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - source account in status rejected', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber2
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - source account in status rejected', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber2,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 25,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    userMethods.logout('logout teller 13', context => context['login teller 13']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 13', context => accountId2, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 13', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 13', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 13', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    userMethods.logout('logout admin 13', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 14', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    userMethods.logout('logout admin 13', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 14', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 10',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - negative transfer amount', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: -TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure - negative amount is not allowed');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - negative transfer amount', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: -TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 26,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure - negative amount is not allowed');
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - GL account as source account', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: opt.feeCashInBranch
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cash-out-branch transaction - GL account as source account', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: opt.feeCashOutBranch,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 27,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    userMethods.logout('logout teller 14', context => context['login teller 14']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 13', context => accountId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 13', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 13', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 13', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    // wallet-to-wallet transaction by MSISDN - uses the default account of the customer, the one created during the self-register process
                    // Edit default customer account - change product
                    commonFunc.createStep('ledger.account.edit', 'edit default account of customer', context => {
                        return {
                            account: {
                                accountId: context['fetch default customer account'].account[0].accountId,
                                accountName: ACCOUNTNAME + '3',
                                accountNumber: context['fetch default customer account'].account[0].accountNumber,
                                ownerId: customerActorId,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1
                            },
                            accountPerson: {
                                accountId: context['fetch default customer account'].account[0].accountId,
                                personId: customerActorId,
                                isDefault: 1
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + '3', 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    accountMethods.approveAccount('approve edit of default customer account', context => {
                        return {
                            accountId: context['fetch default customer account'].account[0].accountId
                        };
                    }),
                    commonFunc.createStep('ledger.userAccountByPhoneNumber.get', 'get default account of customer 1 by phone number', context => {
                        return {
                            phoneNumber: PHONENUMBER
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateGetUserAccountByPhoneNumber(result).error, null, 'return correct details for customer accounts by phone number');
                        assert.true(result.customerAccount.some(account => account.accountName === ACCOUNTNAME + '3'), 'return default account');
                    }),
                    userMethods.logout('logout admin 14', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 15', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 10',
                        context => [context['fetch default customer account'].account[0].accountId,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute cash-in-branch transaction - by msisdn', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.MSISDN,
                                value: PHONENUMBER},
                            transferIdAcquirer: TRANSFERIDACQUIRER + 28,
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME + '3', 'return correct source account name - customer default account');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 28, 'return correct transferIdAcquirer');
                    }),
                    userMethods.logout('logout teller 15', context => context['login teller 15']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 14', context => context['fetch default customer account'].account[0].accountId, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 14', context => context['fetch fee account id'].account[0].accountId, TRANSACTIONFEEVALUE + DEFAULTCREDIT - FEETOOTHERTAXVALUE - FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 14', context => context['fetch vat account id'].account[0].accountId, FEETOVATVALUE + DEFAULTCREDIT, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 14', context => context['fetch otherTax account id'].account[0].accountId, FEETOOTHERTAXVALUE + DEFAULTCREDIT, PRECISION),
                    userMethods.logout('logout admin 15', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 16', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    /** Reversal scenario */
                    transferMethods.setBalance('set default balance in all accounts 11',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute transaction', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 'reverse',
                            description: operationNameCashOutBranch
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                    }),
                    commonFunc.createStep('transfer.transfer.get', 'get transaction information', (context) => {
                        return {
                            transferIdAcquirer: context['successfully execute transaction'].transferIdAcquirer
                        };
                    }, (result, assert) => {
                        assert.equals(result.sourceAccount, accountNumber1, 'return correct source account');
                        assert.equals(result.transferFee, TRANSACTIONFEEVALUE, 'return correct transfer fee');
                        assert.equals(transferJoiValidation.validateGetTransaction(result).error, null, 'return transaction information');
                    }),
                    commonFunc.createStep('transaction.reverse.execute', 'successfully reverse transaction', (context) => {
                        return {
                            transferId: context['successfully execute transaction'].transferId,
                            message: transferConstants.REVERSALMESSAGE
                        };
                    }, (result, assert) => {
                        assert.equals(result.success, true, 'result successs');
                    }),
                    commonFunc.createStep('transfer.transfer.get', 'get transaction information after reverse', (context) => {
                        return {
                            transferIdAcquirer: context['successfully execute transaction'].transferIdAcquirer
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateGetTransaction(result).error, null, 'return transaction information');
                        assert.true(result.reversed, 'the transaction is reversed');
                    }),
                    userMethods.logout('logout teller 16', context => context['login teller 15']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 15', context => accountId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 15', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 15', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 15', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    /** Scenarios for state */
                    transferMethods.setBalance('set account 1 balance to 0',
                        context => [accountId1], 0),
                    accountMethods.closeAccount('close account 1', context => [accountId1]),
                    accountMethods.approveAccount('approve closing of account', context => {
                        return {
                            accountId: accountId1
                        };
                    }),
                    userMethods.logout('logout admin 16', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller 17', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - closed account', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute transaction -  closed account', (context) => {
                        return {
                            transferType: operationeCodeCashOutBranch,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 29,
                            description: operationNameCashOutBranch
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    })
                ])
            );
        }
    };
};
