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
var coreConstants = require('ut-test/lib/constants/core').constants();
var accountConstants = require('ut-test/lib/constants/account').constants();
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
const STARTDATE = productConstants.STARTDATE;
const ENDDATE = productConstants.ENDDATE;
const MINACCOUNTBALANCE = 200;
const MAXACCOUNTBALANCE = 10000;
const MINACCOUNTOPENINGBALANCE = 200;
// Rule parameters
const TRANSACTIONFEE = 0.1;
const TRANSACTIONFEEPERCENT = 100;
const TRANSACTIONFEEVALUE = TRANSACTIONFEE * TRANSACTIONFEEPERCENT / 100;
const FEETOVATPERCENT = 10;
const FEETOVATVALUE = TRANSACTIONFEE * FEETOVATPERCENT / 100;
const FEETOOTHERTAXPERCENT = 15;
const FEETOOTHERTAXVALUE = TRANSACTIONFEE * FEETOOTHERTAXPERCENT / 100;
// Balance parameters
const DEFAULTCREDIT = 2000;
const PRECISION = transferConstants.PRECISION; // the number of digits after the decimal point
var successfulTransactionsCount = 0;
var SMALLESTNUM = transferConstants.SMALLESTNUM;
var conditionId, orgId1, organizationDepthArray;
var currencyName1, priority;
var operationIdBalanceCheck, operationeCodeBalanceCheck, operationNameBalanceCheck;
var customerTypeIndividual, customerActorId1, customerActorId2, currencyId, category1, category2, productType1, periodicFeeId, productGroupId, roleMobileClientId, roleTellerId;
var accountId1, accountId2, accountId3, accountNumber1, accountNumber2, accountNumber3;
var phonePrefix;
var stdPolicy;
// TODO for successful transactions - change the precision when the logic is implemented in the backend/db

module.exports = function() {
    return {
        type: 'integration',
        name: 'balance check transaction',
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
                    var operationBalanceCheck = result.itemTranslationFetch.find(item => item.itemCode === transferConstants.BALANCECHECK);
                    operationIdBalanceCheck = operationBalanceCheck.itemNameId;
                    operationeCodeBalanceCheck = operationBalanceCheck.itemCode;
                    operationNameBalanceCheck = operationBalanceCheck.itemName;
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
                    // Product setup
                    commonFunc.createStep('ledger.productGroup.fetch', 'fetch product groups', (context) => {
                        return {
                            isForCustomer: 1
                        };
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
                            startDate: STARTDATE,
                            endDate: ENDDATE,
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
                    productMethods.getProduct('get product 1', (context) => context['add product'].product[0].productId),
                    productMethods.approveProduct('approve product', context => {
                        return {
                            productId: context['add product'].product[0].productId,
                            currentVersion: context['get product 1'].product[0].currentVersion
                        };
                    }),
                    productMethods.getProduct('get product 2', (context) => context['add product'].product[0].productId),
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
                        customerActorId1 = result.actorId;
                        assert.equals(result.success, true, 'return success: true');
                    }),
                    commonFunc.createStep('user.user.get', 'get user details', (context) => {
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
                    // Accounts setup
                    commonFunc.createStep('ledger.account.add', 'add account 1', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customerActorId1,
                                productId: context['add product'].product[0].productId,
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
                        accountId1 = result.account[0].accountId;
                        accountNumber1 = result.account[0].accountNumber;
                    }),
                    accountMethods.approveAccount('approve adding of account 1', context => {
                        return {
                            accountId: accountId1
                        };
                    }),
                    commonFunc.createStep('ledger.account.add', 'add account 2', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customerActorId1,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME + 2
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: customerActorId1
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                        accountId2 = result.account[0].accountId;
                        accountNumber2 = result.account[0].accountNumber;
                    }),
                    commonFunc.createStep('ledger.account.add', 'add account 3', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customerActorId2,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME + 3
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: customerActorId2
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                        accountId3 = result.account[0].accountId;
                        accountNumber3 = result.account[0].accountNumber;
                    }),
                    accountMethods.approveAccount('approve adding of account 3', context => {
                        return {
                            accountId: accountId3
                        };
                    }),
                    accountMethods.fetchAccount('fetch fee account id', context => {
                        return {
                            accountNumber: opt.feeBalanceCheck
                        };
                    }),
                    accountMethods.fetchAccount('fetch vat account id', context => {
                        return {
                            accountNumber: opt.vatBalanceCheck
                        };
                    }),
                    accountMethods.fetchAccount('fetch otherTax account id', context => {
                        return {
                            accountNumber: opt.otherTaxBalanceCheck
                        };
                    }),
                    /** RULE SETUP
                     * @conditionItem @conditionActor - used to define permissions for the transaction (which role, product, transaction type)
                     * @splitRange - defines the amount which will be splitted between the different accounts.
                     * The split range amount may be defined as "percent" (percent of the transaction amount) OR minValue(amount which is not calculated from the transaction amount)
                     * @splitAssignment - defines the way in which the amount in the split range will be splitted between the different accounts.
                     */
                    commonFunc.createStep('db/rule.rule.add', 'add rule for balance check 1', (context) => {
                        return {
                            condition: {
                                priority: priority - 1 // mandatory
                            },
                            conditionItem: [{
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdBalanceCheck
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
                                            name: 'Balance check',
                                            tag: ruleConstants.ACQUIRERFEETAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            // Pulls funds from the customer account and sends them to the GL fee account.
                                            // The sent amount is percent of the amount defined in the split range (TRANSACTIONFEEPERCENT * TRANSACTIONFEE / 100)
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeBalanceCheck,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Balance check'
                                        }, {
                                            // Pulls funds from the GL fee account and sends them to the GL VAT account.
                                            // The sent amount is percent of the amount defined in the split range (FEETOVATPERCENT * TRANSACTIONFEE / 100)
                                            debit: opt.feeBalanceCheck,
                                            credit: opt.vatBalanceCheck,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee -  Balance check',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            // Pulls funds from the GL fee account and sends them to the GL other tax account.
                                            // The sent amount is percent of the amount defined in the split range (FEETOOTHERTAXPERCENT * TRANSACTIONFEE / 100)
                                            debit: opt.feeBalanceCheck,
                                            credit: opt.otherTaxBalanceCheck,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax -  Balance check',
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
                            operation: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            destinationAccount: accountNumber1,
                            amount: 0,
                            currency: currencyName1
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateDecisionLookup(result).error, null, 'Return all detals after decision lookup');
                        assert.true(result.split.every(split => split.conditionId === conditionId), 'return correct conditionId');
                    }),
                    /** Scenarios with product which is WITHOUT min and max account balance */
                    // Check balance with insufficient balance in the customer account
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - no money in the customer account', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Insufficient balance');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccesfully check balance - no money in the customer account', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 1,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Insufficient balance');
                    }),
                    transferMethods.setBalance('set insufficient balance in customer account - less than balance check fee',
                        context => [accountId1], TRANSACTIONFEE - SMALLESTNUM),
                    transferMethods.setBalance('set default balance in fee, vat and otherTax accounts',
                         context => [context['fetch fee account id'].account[0].accountId,
                             context['fetch vat account id'].account[0].accountId, context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - customer account balance is less than balance check fee', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Insufficient balance');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccesfully check balance - customer account balance is less than balance check fee', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 2,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Insufficient balance');
                    }),
                    transferMethods.setBalance('set customer account balance same as balance check fee',
                        context => [accountId1], TRANSACTIONFEE),
                    // Check balance with minimum sufficient balance in the customer account (the product is without min and max account limits)
                    commonFunc.createStep('transaction.validate', 'successful transaction validation - customer account balance is same as balance check fee', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after validating transaction');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.sourceAccount.accountNumber, accountNumber1, 'return correct account number');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct account name');
                        assert.equals(result.sourceAccount.msisdn, phonePrefix + PHONENUMBER, 'return correct msisdn');
                        assert.equals(result.sourceAccount.customerName, customerConstants.FIRSTNAME + ' ' + customerConstants.LASTNAME, 'return correct customer name');
                        assert.equals(result.transferType, operationeCodeBalanceCheck, 'return correct transferType');
                        assert.equals(result.description, operationNameBalanceCheck, 'return correct description');
                        assert.equals(result.currency, currencyName1, 'return correct currency');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully check balance - customer account balance is same as balance check fee', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 3,
                            description: operationNameBalanceCheck
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.balance, 0, 'return correct account balance');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout user 1', context => context['login user 1']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // Check that the balances of all accounts in the transaction are updated correctly
                    accountMethods.getAccountBalance('get customer account balance 1', context => accountId1, 0),
                    accountMethods.getAccountBalance('get fee account balance 1', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 1', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 1', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    // Check balance as a SA user - missing permissions case
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - missing permission', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'Missing permissions for executing transcton');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - missing permission', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 4,
                            description: operationNameBalanceCheck
                        };
                    }, null,
                        (error, assert) => {
                            assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'Missing permissions for executing transcton');
                        }),
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
                    userMethods.loginMobile('login user 2', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set customer account balance less than product min account balance + balance check fee',
                        context => [accountId1], MINACCOUNTBALANCE - SMALLESTNUM),
                    transferMethods.setBalance('set default balance in fee, vat and otherTax accounts 1',
                        context => [context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    // Check balance when customer account balance is less than product min account balance + balance check fee
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - customer balance less than the product minAccountBalance limit', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'return failure - insufficient balance');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - customer balance less than the product minAccountBalance limit', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 5,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'return failure - insufficient balance');
                    }),
                    transferMethods.setBalance('set customer account balance equal to product min account balance + balance check fee',
                        context => [accountId1], MINACCOUNTBALANCE + TRANSACTIONFEE),
                    // Check balance when customer account balance is same as product min account balance + balance check fee
                    commonFunc.createStep('transaction.validate', 'successful transaction validation - customer balance within the product minAccountBalance limit', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after validating transaction');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.sourceAccount.accountNumber, accountNumber1, 'return correct account number');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully check balance - customer balance within the product minAccountBalance limit', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 6,
                            description: operationNameBalanceCheck
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.balance, commonFunc.roundNumber(MINACCOUNTBALANCE, PRECISION), 'return correct account balance');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout user 2', context => context['login user 2']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 2', context => accountId1, MINACCOUNTBALANCE),
                    accountMethods.getAccountBalance('get fee account balance 2', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 2', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 2', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    userMethods.logout('logout admin 2', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 3', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set customer account balance more than product max account balance + balance check fee',
                        context => [accountId1], MAXACCOUNTBALANCE + TRANSACTIONFEE + SMALLESTNUM),
                    transferMethods.setBalance('set default balance in fee, vat and otherTax accounts 2',
                    context => [context['fetch fee account id'].account[0].accountId,
                        context['fetch vat account id'].account[0].accountId,
                        context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - customer balance more than the product maxAccountBalance limit', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'return failure - insufficient balance');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - customer balance more than the product maxAccountBalance limit', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 7,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'return failure - insufficient balance');
                    }),
                    transferMethods.setBalance('set customer account balance same as product max account balance + balance check fee',
                        context => [accountId1], MAXACCOUNTBALANCE + TRANSACTIONFEE),
                    commonFunc.createStep('transaction.validate', 'successful transaction validation - customer balance within the product maxAccountBalance limit', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after validating transaction');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.sourceAccount.accountNumber, accountNumber1, 'return correct account number');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully check balance - customer balance within the product maxAccountBalance limit', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 8,
                            description: operationNameBalanceCheck
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.balance, commonFunc.roundNumber(MAXACCOUNTBALANCE, PRECISION), 'return correct account balance');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        successfulTransactionsCount += 1;
                    }),
                    userMethods.logout('logout user 3', context => context['login user 3']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 3', context => accountId1, MAXACCOUNTBALANCE),
                    accountMethods.getAccountBalance('get fee account balance 3', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 3', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 3', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    /** Scenarios for rule limits */
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add maxCountDaily limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1 // mandatory
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdBalanceCheck
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
                                maxCountDaily: successfulTransactionsCount + 1
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Balance check',
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
                                            credit: opt.feeBalanceCheck,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Balance check'
                                        }, {
                                            debit: opt.feeBalanceCheck,
                                            credit: opt.vatBalanceCheck,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee -  Balance check',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeBalanceCheck,
                                            credit: opt.otherTaxBalanceCheck,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax -  Balance check',
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
                    userMethods.loginMobile('login user 4', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('db/rule.decision.lookup', 'get rule for user 1', (context) => {
                        return {
                            channelId: context['self register customer'].actorId,
                            operation: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            destinationAccount: accountNumber1,
                            amount: 0,
                            currency: currencyName1
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateDecisionLookup(result).error, null, 'Return all detals after decision lookup');
                        assert.true(result.split.every(split => split.conditionId === conditionId), 'return correct conditionId');
                    }),
                    transferMethods.setBalance('set default balance in all accounts',
                         context => [accountId1,
                             context['fetch fee account id'].account[0].accountId,
                             context['fetch vat account id'].account[0].accountId,
                             context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - duplicate transferIdAcquirer', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 8,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSFERIDALREADYEXISTS, 'transferIdAcquirer must be unique');
                    }),
                    commonFunc.createStep('transaction.validate', 'successful transaction validation - within the limits of rule maxCountDaily transactions', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after validating transaction');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.sourceAccount.accountNumber, accountNumber1, 'return correct account number');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully check balance - within the limits of rule maxCountDaily transactions', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 9,
                            description: operationNameBalanceCheck
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.balance, commonFunc.roundNumber(DEFAULTCREDIT - TRANSACTIONFEE, PRECISION), 'return correct account balance');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                    }),
                    commonFunc.createStep('transfer.transfer.get', 'get balance check transaction information', (context) => {
                        return {
                            transferIdAcquirer: context['successfully check balance - within the limits of rule maxCountDaily transactions'].transferIdAcquirer
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateGetTransaction(result).error, null, 'return transaction information');
                        assert.equals(result.sourceAccount, accountNumber1, 'return correct source account');
                        assert.equals(result.transferFee, TRANSACTIONFEEVALUE, 'return correct transfer fee');
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - exceeding the limits of rule maxCountDaily transactions', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.DAILYLIMITCOUNTERROR, 'daily transactions count limit reached');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - exceeding the limits of rule maxCountDaily transactions', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 10,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.DAILYLIMITCOUNTERROR, 'daily transactions count limit reached');
                    }),
                    userMethods.logout('logout user 4', context => context['login user 4']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 4', context => accountId1, DEFAULTCREDIT - TRANSACTIONFEE),
                    accountMethods.getAccountBalance('get fee account balance 4', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 4', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 4', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    /** Negative scenarios for status - transactions can be processed only for accounts in status Approved  */
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - remove limits', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdBalanceCheck
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
                                            name: 'Balance check',
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
                                            credit: opt.feeBalanceCheck,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Balance check'
                                        }, {
                                            debit: opt.feeBalanceCheck,
                                            credit: opt.vatBalanceCheck,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee -  Balance check',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeBalanceCheck,
                                            credit: opt.otherTaxBalanceCheck,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax -  Balance check',
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
                    commonFunc.createStep('ledger.account.edit', 'edit account 1', context => {
                        return {
                            account: {
                                accountId: accountId1,
                                accountName: ACCOUNTNAME + 'update',
                                accountNumber: accountNumber1,
                                ownerId: customerActorId1,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1
                            },
                            accountPerson: {
                                accountId: accountId1,
                                personId: customerActorId1
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + 'update', 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    transferMethods.setBalance('set default balance in all accounts 1',
                         context => [accountId1,
                             context['fetch fee account id'].account[0].accountId,
                             context['fetch vat account id'].account[0].accountId,
                             context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    userMethods.logout('logout admin 4', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 5', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - account in status pending', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - account in status pending, account pending', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 11,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account pending');
                    }),
                    userMethods.logout('logout user 5', context => context['login user 5']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.rejectAccount('reject account', context => accountId1),
                    userMethods.logout('logout admin 5', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 6', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - account in status rejected', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account rejected');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - account in status rejected', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 12,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account rejected');
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - account in status new', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber2
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - account in status new', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber2,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 13,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTNOTFOUNDERROR, 'return failure - account not found');
                    }),
                    userMethods.logout('logout user 6', context => context['login user 6']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that there are no changes in the account balances after executing the negative scenarios for status
                    accountMethods.getAccountBalance('get customer account balance 5', context => accountId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 5', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 5', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 5', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.discardAccount('discard changes in account 1', context => {
                        return {
                            accountId: accountId1
                        };
                    }),
                    userMethods.logout('logout admin 6', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 7', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    /** Check balance for account which is not the customer's account */
                    transferMethods.setBalance('set default balance in all accounts 2',
                        context => [accountId1,
                            accountId3,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - account which does not belong to the logged user', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber3
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - account which does not belong to the logged user', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber3,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 14,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - account which does not belong to the logged user - GL account', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber3
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - account which does not belong to the logged user - GL account', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: opt.feeBalanceCheck,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 15,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - destination account is used instead of source', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            destinationAccount: opt.feeBalanceCheck,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 16,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure - sourceAccount is mandatory');
                    }),
                    userMethods.logout('logout user 7', context => context['login user 6']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // Check that the balances in account 1 and 2 are unchanged
                    accountMethods.getAccountBalance('get customer account 1 balance 5', context => accountId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get customer account 3 balance 5', context => accountId3, DEFAULTCREDIT),
                    /** Negative scenarios with missing rule conditionItem for product */
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - remove conditionItem for product', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdBalanceCheck
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
                                            name: 'Balance check',
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
                                            credit: opt.feeBalanceCheck,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Balance check'
                                        }, {
                                            debit: opt.feeBalanceCheck,
                                            credit: opt.vatBalanceCheck,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee -  Balance check',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeBalanceCheck,
                                            credit: opt.otherTaxBalanceCheck,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax -  Balance check',
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
                        assert.equals(result.conditionItem.find(item => item.factor === ruleConstants.SOURCECATEGORY), undefined, 'conditionItem for product is not defined');
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                    }),
                    userMethods.logout('logout admin 7', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 8', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - correct account with missing rule conditionItem for product', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 17,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - missing permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - GL account with missing rule conditionItem for product', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: opt.feeBalanceCheck,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 18,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - missing permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - another customer account with missing rule conditionItem for product', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber3,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 19,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - missing permission');
                    }),
                    userMethods.logout('logout user 8', context => context['login user 7']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - restore product conditionItem, add role teller to conditionActor', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdBalanceCheck
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileClientId
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleTellerId
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Balance check',
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
                                            credit: opt.feeBalanceCheck,
                                            percent: TRANSACTIONFEEPERCENT,
                                            description: 'Transfer fee - Balance check'
                                        }, {
                                            debit: opt.feeBalanceCheck,
                                            credit: opt.vatBalanceCheck,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee -  Balance check',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeBalanceCheck,
                                            credit: opt.otherTaxBalanceCheck,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other tax -  Balance check',
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
                    userMethods.logout('logout admin 8', context => context.login['identity.check'].sessionId),
                    userMethods.login('login teller', userConstants.USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                    transferMethods.setBalance('set default balance in all accounts 3',
                         context => [accountId1,
                             context['fetch fee account id'].account[0].accountId,
                             context['fetch vat account id'].account[0].accountId,
                             context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'successful transaction validation - by teller user', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber1
                            },
                            description: operationNameBalanceCheck
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after validating transaction');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.sourceAccount.accountNumber, accountNumber1, 'return correct account number');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully check balance - by teller user', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 20,
                            description: operationNameBalanceCheck
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after validating transaction');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.sourceAccount.accountNumber, accountNumber1, 'return correct account number');
                    }),
                    commonFunc.createStep('transaction.reverse.execute', 'unsuccessfully reverse transaction - not reversible transaction', (context) => {
                        return {
                            transferId: context['successfully check balance - by teller user'].transferId,
                            message: transferConstants.REVERSALMESSAGE
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.UNSUPPORTEDREVERSETYPEERROR, 'return failure - unsupported reverse type');
                    }),
                    userMethods.logout('logout teller', context => context['login teller']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 6', context => accountId1, DEFAULTCREDIT - TRANSACTIONFEE),
                    accountMethods.getAccountBalance('get fee account balance 6', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 6', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 6', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.approveAccount('approve adding of account 2', context => {
                        return {
                            accountId: accountId2
                        };
                    }),
                    accountMethods.closeAccount('close account 2', context => [accountId2]),
                    accountMethods.approveAccount('approve close of account', context => {
                        return {
                            accountId: accountId2
                        };
                    }),
                    userMethods.logout('logout admin 9', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login user 9', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - closed account', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountNumber2
                            },
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - missing permission, account closed');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully check balance - closed account', (context) => {
                        return {
                            transferType: operationeCodeBalanceCheck,
                            sourceAccount: accountNumber2,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 20,
                            description: operationNameBalanceCheck
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - missing permission, account closed');
                    })
                    /** TODO Scenarios for state - transactions cannot be processed for account in state Blocked */
                ])
            );
        }
    };
};
