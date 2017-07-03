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
var customerConstants = require('ut-test/lib/constants/customer').constants();
var documentConstants = require('ut-test/lib/constants/document').constants();
var productConstants = require('ut-test/lib/constants/product').constants();
var ruleConstants = require('ut-test/lib/constants/rule').constants();
var transferConstants = require('ut-test/lib/constants/transfer').constants();
var userConstants = require('ut-test/lib/constants/user').constants();
const TRANSFERIDACQUIRER = transferConstants.TRANSFERIDACQUIRER;
const GETBYDEPTHORGANIZATION = customerConstants.GETBYDEPTHORGANIZATION;
const RANDOMCONDITIONID = customerConstants.RANDOMCONDITIONID;
const KYCDESCRIPTION = customerConstants.KYCDESCRIPTION;
const PRODUCTNAME = productConstants.PRODUCTNAME;
const STARTDATE = productConstants.STARTDATE;
const ENDDATE = productConstants.ENDDATE;
const PHONENUMBER = customerConstants.PHONENUMBER.slice(3);
// Rule parameters
const TRANSFERAMOUNT = 1000;
const CUSTOMERTOMERCHANTPERCENT = 100; // CUSTOMERTOMERCHANTPERCENT * TRANSFERAMOUNT is the amount which will be transferred to the merchant
// Transaction fee value is calculated as percent(TRANSACTIONFEEPERCENT) of the TRANSACTIONFEE set in the rule;
const TRANSACTIONFEE = 150;
const TRANSACTIONFEEPERCENT = 100;
const TRANSACTIONFEEVALUE = TRANSACTIONFEE * TRANSACTIONFEEPERCENT / 100;
// VAT and other taxes are calculated as percent (FEETOVATPERCENT, FEETOOTHERTAXPERCENT) of FEEBASEFORVATANDTAX(FEEBASEFORVATANDTAX must be smaller than TRANSACTIONFEE)
const FEEBASEFORVATANDTAX = 120; // this is the base on which the VAT and other tax will be calculated
const FEETOVATPERCENT = 10;
const FEETOVATVALUE = FEEBASEFORVATANDTAX * FEETOVATPERCENT / 100;
const FEETOOTHERTAXPERCENT = 15;
const FEETOOTHERTAXVALUE = FEEBASEFORVATANDTAX * FEETOOTHERTAXPERCENT / 100;
// Balance parameters
const MINACCOUNTBALANCE = 200;
const MAXACCOUNTBALANCE = 10000;
const PRECISION = 4;
var SMALLESTNUM = 0.0001;
const MINACCOUNTOPENINGBALANCE = 200;
const DEFAULTCREDIT = 2000;
const CURRENCY = 'currency';
const OPERATION = 'operation';
const MERCHANT = 'Merchant';
const TELLER = 'Teller';
const TELLERUSERNAME = userConstants.USERNAME + 'teller';
const MOBILECLIENT = 'MobileClient';
const CHANNELMOBILE = 'mobile';
const IMEI = (Math.floor(100000000000000 + Math.random() * 999999999999999)).toString();
const IMEI1 = (Math.floor(100000000000000 + Math.random() * 999999999999999)).toString();
const ACCOUNTNAME = 'TestAccount' + commonFunc.generateRandomNumber();
// Errors
const INSUFFICIENTBALANCEERROR = 'ledger.insufficientBalance';
const ACCOUNTBALANCERESTRICTIONFAILURE = 'ledger.accountBalanceRestrictionFailure';
const MINLIMITAMOUNTFAILURE = 'rule.exceedMinLimitAmount';
const ACCOUNTSTATUSFAILURE = 'ledger.accountStatusFailure';
const UNAUTHORIZEDTRANSFERERROR = 'transfer.unauthorizedTransfer';
const UNAUTHORIZEDTRANSFER = 'transfer.unauthorizedTransfer';
const REJECTFAILURE = 'transfer.rejectFailure';
const SECURITYVIOLATIONERROR = 'user.securityViolation';
var conditionId, orgId1, organizationDepthArray;
var currencyName1, priority;
var operationIdMerchantPayment, operationIdMerchantPullRequest, operationeCodeMerchantPayment, operationeCodeMerchantPullRequest, operationNameMerchantPayment, operationNameMerchantPullRequest;
var customerTypeIndividual, customer1ActorId, currencyId, category1, category2, productType, productTypeId, periodicFeeId, productGroup, productGroupId, roleTellerId, roleMerchantId, roleMobileClientId;
var accountCustomer1Id, accountMerchantId1, accountMerchantId2, accountCustomer1Number, accountMerchantNumber1;
var stdPolicy;
// var phonePrefix;
var rejectReasonId, cancelReasonId;
var CANCELTRANSACTION = 'cancel'; // merchant cancels
var REJECTTRANSACTION = 'reject'; // customer rejects
var APPROVETRANSACTION = 'approve'; // customer approves
var APPROVEDSTATUS = 'approved';
var CANCELEDSTATUS = 'canceled';
var REJECTEDSTATUS = 'rejected';

// Wallet customer deposits money into his/her wallet by visiting a branch
module.exports = function(opt, cache) {
    test({
        type: 'integration',
        name: 'merchant pull request/ merchant payment',
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
                        itemTypeName: CURRENCY
                    };
                }, (result, assert) => {
                    assert.equals(coreJoiValidation.validateFetchItemTranslation(result.itemTranslationFetch[0]).error, null, 'Return all details after listing itemName');
                    var currency = result.itemTranslationFetch.find(curr => curr.itemCode === transferConstants.TZSCURRENCY);
                    currencyName1 = currency.itemName;
                    currencyId = currency.itemNameId;
                }),
                commonFunc.createStep('core.itemTranslation.fetch', 'fetch operations', (context) => {
                    return {
                        itemTypeName: OPERATION
                    };
                }, (result, assert) => {
                    assert.equals(coreJoiValidation.validateFetchItemTranslation(result.itemTranslationFetch[0]).error, null, 'Return all details after listing itemName');
                    var operationMerchantPullRequest = result.itemTranslationFetch.find(item => item.itemCode === transferConstants.MERCHANTPULLREQUEST);
                    operationIdMerchantPullRequest = operationMerchantPullRequest.itemNameId;
                    operationeCodeMerchantPullRequest = operationMerchantPullRequest.itemCode;
                    operationNameMerchantPullRequest = operationMerchantPullRequest.itemName;
                    var operationMerchantPayment = result.itemTranslationFetch.find(item => item.itemCode === transferConstants.MERCHANTPAYMENT);
                    operationIdMerchantPayment = operationMerchantPayment.itemNameId;
                    operationeCodeMerchantPayment = operationMerchantPayment.itemCode;
                    operationNameMerchantPayment = operationMerchantPayment.itemName;
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
                        key: GETBYDEPTHORGANIZATION
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
                                imei: IMEI
                            }
                        };
                    }, (result, assert) => {
                        customer1ActorId = result.actorId;
                        assert.equals(result.success, true, 'return success: true');
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
                        // customer2ActorId = result.actorId;
                        assert.equals(result.success, true, 'return success: true');
                    }),
                    commonFunc.createStep('ledger.account.fetch', 'fetch default customer 1 account', context => {
                        return {
                            filterBy: {
                                ownerId: customer1ActorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateFetchAccount(result.account).error, null, 'Return all details after fetching account');
                        productGroup = result.account[0].productGroup;
                        productType = result.account[0].productType;
                    }),
                    // get state id - to be removed later
                    commonFunc.createStep('ledger.account.get', 'get default customer account', context => {
                        return {
                            accountId: context['fetch default customer 1 account'].account[0].accountId
                        };
                    }, (result, assert) => {
                        // console.log(result);
                    }),
                    commonFunc.createStep('user.user.get', 'get user details', (context) => {
                        return {
                            actorId: customer1ActorId
                        };
                    }, (result, assert) => {
                        assert.equals(customerJoiValidation.validateGetPerson(result.person, customerConstants.FIRSTNAME).error, null, 'return person');
                        assert.equals(result['user.hash'][0].identifier, PHONENUMBER, 'return username = customer phone number in user.hash');
                        roleMerchantId = result.rolesPossibleForAssign.find(role => role.name === MERCHANT).roleId;
                        roleMobileClientId = result.rolesPossibleForAssign.find(role => role.name === MOBILECLIENT && role.isAssigned === 1).roleId;
                        roleTellerId = result.rolesPossibleForAssign.find(role => role.name === TELLER).roleId;
                    }),
                    commonFunc.createStep('ledger.userAccountByPhoneNumber.get', 'get account by phone number', context => {
                        return {
                            phoneNumber: PHONENUMBER
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateGetUserAccountByPhoneNumber(result).error, null, 'return correct details for customer accounts by phone number');
                        // phonePrefix = result.customerData[0].phonePrefix;
                    }),
                    // Merchant setup
                    userMethods.addUser('add merchant', context => {
                        return {
                            object: context['get admin details'].memberOF[0].object,
                            policyId: stdPolicy,
                            roles: [roleMerchantId],
                            defaultRoleId: roleMerchantId
                        };
                    }, userConstants.USERNAME),
                    userMethods.approveUser('approve adding of merchant', context => context['add merchant'].person.actorId),
                    // Teller user setup
                    userMethods.addUser('add teller', context => {
                        return {
                            object: context['get admin details'].memberOF[0].object,
                            policyId: stdPolicy,
                            roles: [roleTellerId],
                            defaultRoleId: roleTellerId
                        };
                    }, TELLERUSERNAME),
                    userMethods.approveUser('approve first user', context => context['add teller'].person.actorId),
                    // Product setup
                    commonFunc.createStep('ledger.productGroup.fetch', 'fetch product groups', (context) => {
                        return {};
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
                    commonFunc.createStep('ledger.product.add', 'add customer product', (context) => productParams.addProductParams(context, (context) => {
                        return {
                            customerTypeId: customerTypeIndividual,
                            businessUnitId: orgId1,
                            currencyId: currencyId,
                            startDate: STARTDATE,
                            endDate: ENDDATE,
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
                    productMethods.getProduct('get customer product 1', (context) => context['add customer product'].product[0].productId),
                    productMethods.approveProduct('approve customer product', context => {
                        return {
                            productId: context['add customer product'].product[0].productId,
                            currentVersion: context['get customer product 1'].product[0].currentVersion
                        };
                    }),
                    productMethods.getProduct('get customer product 2', (context) => context['add customer product'].product[0].productId),
                    commonFunc.createStep('ledger.product.add', 'add merchant product', (context) => productParams.addProductParams(context, (context) => {
                        return {
                            customerTypeId: customerTypeIndividual,
                            businessUnitId: orgId1,
                            currencyId: currencyId,
                            startDate: STARTDATE,
                            endDate: ENDDATE,
                            // minAccountBalance: MINACCOUNTBALANCE,
                            // maxAccountBalance: MAXACCOUNTBALANCE,
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
                    productMethods.getProduct('get merchant product 1', (context) => context['add merchant product'].product[0].productId),
                    productMethods.approveProduct('approve merchant product', context => {
                        return {
                            productId: context['add merchant product'].product[0].productId,
                            currentVersion: context['get merchant product 1'].product[0].currentVersion
                        };
                    }),
                    productMethods.getProduct('get merchant product 2', (context) => context['add merchant product'].product[0].productId),
                    // Accounts setup
                    commonFunc.createStep('ledger.account.add', 'add customer 1 account', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: customer1ActorId,
                                productId: context['add customer product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME + 1
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: customer1ActorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                        accountCustomer1Id = result.account[0].accountId;
                        accountCustomer1Number = result.account[0].accountNumber;
                    }),
                    accountMethods.approveAccount('approve adding of customer account', context => {
                        return {
                            accountId: accountCustomer1Id
                        };
                    }),
                    commonFunc.createStep('ledger.account.add', 'add merchant account', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: context['add merchant'].person.actorId,
                                productId: context['add merchant product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME + 2
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: context['add merchant'].person.actorId,
                                isDefault: 1
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                        accountMerchantId1 = result.account[0].accountId;
                        accountMerchantNumber1 = result.account[0].accountNumber;
                    }),
                    accountMethods.approveAccount('approve adding of merchant account', context => {
                        return {
                            accountId: accountMerchantId1
                        };
                    }),
                    commonFunc.createStep('ledger.account.add', 'add merchant account 2', context => {
                        return {
                            account: {
                                accountId: -1,
                                ownerId: context['add merchant'].person.actorId,
                                productId: context['add merchant product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME + 3
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: context['add merchant'].person.actorId,
                                isDefault: 0
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                        accountMerchantId2 = result.account[0].accountId;
                        // accountMerchantNumber2 = result.account[0].accountNumber;
                    }),
                    accountMethods.approveAccount('approve adding of merchant account 2', context => {
                        return {
                            accountId: accountMerchantId2
                        };
                    }),
                    accountMethods.fetchAccount('fetch fee account id', context => {
                        return {
                            accountNumber: opt.feeMerchantPayment
                        };
                    }),
                    accountMethods.fetchAccount('fetch vat account id', context => {
                        return {
                            accountNumber: opt.vatMerchantPayment
                        };
                    }),
                    accountMethods.fetchAccount('fetch otherTax account id', context => {
                        return {
                            accountNumber: opt.otherTaxMerchantPayment
                        };
                    }),
                    /** RULE SETUP
                     * @conditionItem @conditionActor - used to define permissions for the transaction (which role, sender and receiver product, transaction type)
                     * @splitRange - defines the amount which will be splitted between the different accounts.
                     * The split range amount may be defined as "percent" (percent of the transaction amount) OR  minValue(amount which is not calculated from the transaction amount)
                     * @splitAssignment - defines the way in which the amount in the split range will be splitted between the different accounts.
                     */
                    commonFunc.createStep('db/rule.rule.add', 'add rule for merchant pull request', (context) => {
                        return {
                            condition: {
                                priority: priority - 1
                            },
                            conditionItem: [{
                                factor: 'oc', // operation.id
                                itemNameId: operationIdMerchantPullRequest
                            }, {
                                factor: 'sc', // source.account.product - customer
                                itemNameId: context['get customer product 2'].product[0].itemNameId
                            }, {
                                factor: 'dc', // destination.account.product - merchant
                                itemNameId: context['get merchant product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: 'co', // role
                                actorId: roleMerchantId
                            }]
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateAddRule(result).error, null, 'Return all detals after add rule');
                    }),
                    commonFunc.createStep('db/rule.rule.add', 'add rule for merchant payment', (context) => {
                        return {
                            condition: {
                                priority: priority - 2
                            },
                            conditionItem: [{
                                factor: 'oc', // operation.id
                                itemNameId: operationIdMerchantPayment
                            }, {
                                factor: 'sc', // source.account.product - customer
                                itemNameId: context['get customer product 2'].product[0].itemNameId
                            }, {
                                factor: 'dc', // destination.account.product - merchant
                                itemNameId: context['get merchant product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: 'co', // role
                                actorId: roleMobileClientId
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Transfer amount',
                                            tag: '|merchant|'
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: CUSTOMERTOMERCHANTPERCENT, // 100 %
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: transferConstants.SOURCEACCOUNTNUMBER,
                                            credit: transferConstants.DESTINATIONACCOUNTNUMBER,
                                            percent: CUSTOMERTOMERCHANTPERCENT, // 100 %
                                            description: 'Transfer amount'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: '|acquirer|fee|'
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE, // 150
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: transferConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeMerchantPayment,
                                            percent: TRANSACTIONFEEPERCENT, // 100 %
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: '|fee|'
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: FEEBASEFORVATANDTAX, // 120
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeMerchantPayment,
                                            credit: opt.vatMerchantPayment,
                                            percent: FEETOVATPERCENT, // 10%
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: transferConstants.FEETYPE,
                                                value: transferConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeMerchantPayment,
                                            credit: opt.otherTaxMerchantPayment,
                                            percent: FEETOOTHERTAXPERCENT, // 15%
                                            description: 'Other fee - Transfer',
                                            splitAnalytic: {
                                                name: transferConstants.FEETYPE,
                                                value: transferConstants.OTHERTAX
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
                    transferMethods.listReason('list reject reasons', context => 'reject'),
                    commonFunc.createStep('transfer.reason.list', 'list reject reasons', context => {
                        return {
                            action: REJECTTRANSACTION
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateListReason(result).error, null, 'return all details for listed reasons');
                        rejectReasonId = result.transferReasonList[0].itemNameId;
                    }),
                    commonFunc.createStep('transfer.reason.list', 'list cancel reasons', context => {
                        return {
                            action: CANCELTRANSACTION
                        };
                    }, (result, assert) => {
                        cancelReasonId = result.transferReasonList[0].itemNameId;
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login merchant 1', userConstants.USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                    /** Scenarios with product without min and max account balance */
                    transferMethods.setBalance('set default balance in all accounts',
                        context => [accountCustomer1Id, accountMerchantId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'successfully validate merchant pull request 1', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.fee, 0, 'return zero fee');
                        assert.equals(result.otherFee, 0, 'return zero otherFee');
                        assert.equals(result.vat, 0, 'return zero vat');
                        assert.equals(result.transferType, operationeCodeMerchantPullRequest, 'return correct transferType');
                        assert.equals(result.description, operationNameMerchantPullRequest, 'return correct description');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute merchant pull request 1', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 1,
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.fee, 0, 'return zero fee');
                        assert.equals(result.otherFee, 0, 'return zero otherFee');
                        assert.equals(result.vat, 0, 'return zero vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 1, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeMerchantPullRequest, 'return correct transferType');
                    }),
                    commonFunc.createStep('transaction.pendingUserTransfers.fetch', 'merchant fetch pending transactions 1', (context) => {
                        return {};
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validaFetchcPendingUserTransfers(result).error, null, 'return all pending transfer details');
                        assert.true(result.pullTransactions.length === 1, 'return one pending pull transaction');
                        assert.equals(result.pullTransactions[0].transferIdAcquirer, TRANSFERIDACQUIRER + 1, 'rreturn correct transferIdAcquirer');
                        assert.equals(result.pullTransactions[0].transferAmount, TRANSFERAMOUNT, 'return correct transfer amount');
                    }),
                    userMethods.logout('logout merchant 1', context => context['login merchant 1']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances of the accounts are unchanged
                    accountMethods.getAccountBalance('get customer account balance 1', context => accountCustomer1Id, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get merchant account balance 1', context => accountMerchantId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 1', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 1', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 1', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    commonFunc.createStep('identity.check', 'login customer 1', (context) => {
                        return {
                            username: PHONENUMBER,
                            password: context['self register customer 1'].token,
                            newPassword: userConstants.ADMINPASSWORD,
                            uri: userConstants.URI,
                            timezone: userConstants.TIMEZONE,
                            channel: CHANNELMOBILE
                        };
                    }, (result, assert) => {
                        assert.equals(userJoiValidation.validateLogin(result['identity.check']).error, null, 'Return all details after login a user');
                    }),
                    commonFunc.createStep('transaction.pendingUserTransfers.fetch', 'customer fetch pending transactions 1', (context) => {
                        return {};
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validaFetchcPendingUserTransfers(result).error, null, 'return all pending transfer details');
                        assert.true(result.pushTransactions.length === 1, 'return one pending push transaction');
                        assert.equals(result.pushTransactions[0].transferIdAcquirer, TRANSFERIDACQUIRER + 1, 'rreturn correct transferIdAcquirer');
                        assert.equals(result.pushTransactions[0].transferAmount, TRANSFERAMOUNT, 'rreturn correct transfer amount');
                    }),
                    commonFunc.createStep('transaction.validate', 'successfully validate merchant payment 1 by customer', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 1'].transferId
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferType, operationeCodeMerchantPayment, 'return correct transferType');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully reject merchant payment', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 1'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '1a',
                            pullTransferStatus: REJECTTRANSACTION,
                            description: operationNameMerchantPayment,
                            reasonId: rejectReasonId
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.pullTransferStatus, REJECTEDSTATUS, 'return rejected status');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + '1a', 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeMerchantPayment, 'return correct transferType');
                        assert.equals(result.description, operationNameMerchantPayment, 'return correct description');
                    }),
                    commonFunc.createStep('transaction.pendingUserTransfers.fetch', 'customer fetch pending transactions 2', (context) => {
                        return {};
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validaFetchcPendingUserTransfers(result).error, null, 'return all pending transfer details');
                        assert.same(result.pushTransactions, [], 'return no push transactions');
                    }),
                    commonFunc.createStep('transfer.transfer.get', 'get rejected pull request information', (context) => {
                        return {
                            transferIdAcquirer: context['successfully execute merchant pull request 1'].transferIdAcquirer
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateGetTransaction(result).error, null, 'return transaction information');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 1, 'return correct transferIdAcquirer');
                        assert.equals(result.pending.pushTransactionId, null, 'return no pushTransactionId');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully approve rejected merchant payment', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 1'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '1b',
                            pullTransferStatus: APPROVETRANSACTION,
                            description: operationNameMerchantPayment
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, UNAUTHORIZEDTRANSFER, 'unauthorized pull transfer');
                    }),
                    userMethods.logout('logout customer 1', context => context['login customer 1']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances of the accounts are unchanged
                    accountMethods.getAccountBalance('get customer account balance 2', context => accountCustomer1Id, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get merchant account balance 2', context => accountMerchantId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 2', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 2', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 2', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login merchant 2', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.pendingUserTransfers.fetch', 'merchant fetch pending transactions 2', (context) => {
                        return {};
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validaFetchcPendingUserTransfers(result).error, null, 'return all pending transfer details');
                        assert.same(result.pullTransactions, [], 'return no pull transactions');
                    }),
                    transferMethods.setBalance('set default balance in all accounts 1',
                        context => [accountCustomer1Id, accountMerchantId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'successfully validate merchant pull request 2', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountCustomer1Number },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountMerchantNumber1 },
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.fee, 0, 'return zero fee');
                        assert.equals(result.otherFee, 0, 'return zero otherFee');
                        assert.equals(result.vat, 0, 'return zero vat');
                        assert.equals(result.transferType, operationeCodeMerchantPullRequest, 'return correct transferType');
                        assert.equals(result.description, operationNameMerchantPullRequest, 'return correct description');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute merchant pull request 2', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountCustomer1Number },
                            destinationAccount: {
                                type: transferConstants.ACCOUNTNUMBER,
                                value: accountMerchantNumber1 },
                            transferIdAcquirer: TRANSFERIDACQUIRER + 2
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 2, 'return correct transferIdAcquirer');
                    }),
                    userMethods.logout('logout merchant 2', context => context['login merchant 2']['identity.check'].sessionId),
                    userMethods.login('login customer 2', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully cancel merchant payment 2 by a customer', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 2'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '2cancel',
                            pullTransferStatus: CANCELTRANSACTION
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, SECURITYVIOLATIONERROR, 'return security violation failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully approve merchant payment', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 2'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '2a',
                            pullTransferStatus: APPROVETRANSACTION,
                            description: operationNameMerchantPayment
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.pullTransferStatus, APPROVEDSTATUS, 'return approved status');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + '2a', 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeMerchantPayment, 'return correct transferType');
                        assert.equals(result.description, operationNameMerchantPayment, 'return correct description');
                    }),
                    commonFunc.createStep('transaction.pendingUserTransfers.fetch', 'customer fetch pending transactions 3', (context) => {
                        return {};
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validaFetchcPendingUserTransfers(result).error, null, 'return all pending transfer details');
                        assert.same(result.pullTransactions, [], 'return no pull transactions');
                    }),
                    commonFunc.createStep('transfer.transfer.get', 'get approved pull request information', (context) => {
                        return {
                            transferIdAcquirer: context['successfully execute merchant pull request 2'].transferIdAcquirer
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateGetTransaction(result).error, null, 'return transaction information');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 2, 'return correct transferIdAcquirer');
                        assert.true(result.pending.pushTransactionId !== null, 'return pushTransactionId not null'); // === transferId v response-a na approve pull requesta
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully reject approved merchant payment', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 2'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '2b',
                            pullTransferStatus: REJECTTRANSACTION
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, REJECTFAILURE, 'return reject failure');
                    }),
                    userMethods.logout('logout customer 2', context => context['login customer 2']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances of all accounts are updated according to the applied rule
                    accountMethods.getAccountBalance('get customer account balance 3', context => accountCustomer1Id, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get merchant account balance 3', context => accountMerchantId1, DEFAULTCREDIT + TRANSFERAMOUNT, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 3', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 3', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 3', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login merchant 3', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 2',
                        context => [accountCustomer1Id, accountMerchantId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute merchant pull request 3', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 3,
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 3, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeMerchantPullRequest, 'return correct transferType');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully approve merchant payment by a merchant user', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 3'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '3a',
                            pullTransferStatus: APPROVETRANSACTION
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, UNAUTHORIZEDTRANSFERERROR, 'return unauthorized payment');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully reject merchant payment by a merchant user', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 3'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '3b',
                            pullTransferStatus: REJECTTRANSACTION,
                            reasonId: rejectReasonId
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, REJECTFAILURE, 'return reject failure');
                    }),
                    commonFunc.createStep('transaction.pendingUserTransfers.fetch', 'merchant fetch pending transactions 3', (context) => {
                        return {};
                    }, (result, assert) => {
                        assert.true(result.pullTransactions.length === 1, 'return one pending pull transaction');
                        assert.equals(result.pullTransactions[0].transferIdAcquirer, TRANSFERIDACQUIRER + 3, 'rreturn correct transferIdAcquirer');
                        assert.equals(result.pullTransactions[0].transferAmount, TRANSFERAMOUNT, 'return correct transfer amount');
                        assert.equals(transferJoiValidation.validaFetchcPendingUserTransfers(result).error, null, 'return all pending transfer details');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully cancel merchant pull request', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 3'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '3cancel',
                            pullTransferStatus: CANCELTRANSACTION,
                            description: operationNameMerchantPayment,
                            reasonId: cancelReasonId
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.pullTransferStatus, CANCELEDSTATUS, 'return cancelled status');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + '3cancel', 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationeCodeMerchantPayment, 'return correct transferType');
                        assert.equals(result.description, operationNameMerchantPayment, 'return correct description');
                    }),
                    commonFunc.createStep('transaction.pendingUserTransfers.fetch', 'merchant fetch pending transactions 3', (context) => {
                        return {};
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validaFetchcPendingUserTransfers(result).error, null, 'return all pending transfer details');
                        assert.same(result.pullTransactions, [], 'return no pull transactions');
                    }),
                    commonFunc.createStep('transfer.transfer.get', 'get merchant pull request information', (context) => {
                        return {
                            transferIdAcquirer: context['successfully execute merchant pull request 3'].transferIdAcquirer
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateGetTransaction(result).error, null, 'return transaction information');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 3, 'return correct transferIdAcquirer');
                        assert.equals(result.pending.pushTransactionId, null, 'return no pushTransactionId');
                    }),
                    userMethods.logout('logout merchant 3', context => context['login merchant 3']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances of the accounts are unchanged
                    accountMethods.getAccountBalance('get customer account balance 4', context => accountCustomer1Id, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get merchant account balance 4', context => accountMerchantId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 4', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 4', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 4', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login merchant 4', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts',
                        context => [accountCustomer1Id, accountMerchantId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    // execute pull request - the amount is set so that when executing the transaction the customer will not have enough money in his account to pay for it
                    commonFunc.createStep('transaction.execute', 'successfully execute merchant pull request 4', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: commonFunc.roundNumber(DEFAULTCREDIT - TRANSACTIONFEEVALUE + SMALLESTNUM, PRECISION),
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 4,
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, commonFunc.roundNumber(DEFAULTCREDIT - TRANSACTIONFEEVALUE + SMALLESTNUM, PRECISION), 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 4, 'return correct transferIdAcquirer');
                    }),
                    // execute pull request - the amount is set so that after executing the transaction the customer will with account balance = 0
                    commonFunc.createStep('transaction.execute', 'successfully execute merchant pull request 5', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: commonFunc.roundNumber(DEFAULTCREDIT - TRANSACTIONFEEVALUE, PRECISION),
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 5,
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, commonFunc.roundNumber(DEFAULTCREDIT - TRANSACTIONFEEVALUE, PRECISION), 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 5, 'return correct transferIdAcquirer');
                    }),
                    commonFunc.createStep('transaction.pendingUserTransfers.fetch', 'merchant fetch pending transactions 4', (context) => {
                        return {};
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validaFetchcPendingUserTransfers(result).error, null, 'return all pending transfer details');
                        assert.true(result.pullTransactions.length === 2, 'return 2 pull transactions');
                    }),
                    userMethods.logout('logout merchant 4', context => context['login merchant 4']['identity.check'].sessionId),
                    userMethods.login('login customer 3', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.pendingUserTransfers.fetch', 'customer fetch pending transactions 4', (context) => {
                        return {};
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validaFetchcPendingUserTransfers(result).error, null, 'return all pending transfer details');
                        assert.true(result.pushTransactions.length === 2, 'return 2 push transactions');
                    }),
                    commonFunc.createStep('transaction.validate', 'unsuccessfully validate merchant payment - not sufficient balance in customer account', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 4'].transferId
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, INSUFFICIENTBALANCEERROR, 'return failure  - insufficient balance');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully approve merchant payment - not sufficient balance in customer account', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 4'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '4a',
                            pullTransferStatus: APPROVETRANSACTION,
                            description: operationNameMerchantPayment
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, INSUFFICIENTBALANCEERROR, 'return failure  - insufficient balance');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully approve merchant payment - minimum sufficient balance in customer account', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 5'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '4b',
                            pullTransferStatus: APPROVETRANSACTION,
                            description: operationNameMerchantPayment
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, commonFunc.roundNumber(DEFAULTCREDIT - TRANSACTIONFEEVALUE, PRECISION), 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                    }),
                    userMethods.logout('logout customer 3', context => context['login customer 3']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances of all accounts are updated according to the applied rule
                    accountMethods.getAccountBalance('get customer account balance 5', context => accountCustomer1Id, 0),
                    accountMethods.getAccountBalance('get merchant account balance 5', context => accountMerchantId1, DEFAULTCREDIT + (DEFAULTCREDIT - TRANSACTIONFEEVALUE), PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 5', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 5', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 5', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    commonFunc.createStep('ledger.account.edit', 'edit merchant account', context => {
                        return {
                            account: {
                                accountId: accountMerchantId1,
                                accountName: ACCOUNTNAME + '2updated',
                                accountNumber: accountMerchantNumber1,
                                ownerId: context['add merchant'].person.actorId,
                                productId: context['add merchant product'].product[0].productId,
                                stateId: context['add merchant account'].account[0].stateId,
                                businessUnitId: orgId1
                            },
                            accountPerson: {
                                accountId: accountMerchantId1,
                                personId: context['add merchant'].person.actorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + '2updated', 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    /** Scenarios for merchant pull request - only the merchant account's state and status are validated */
                    // TODO add step for closed state
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login merchant 5', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts',
                        context => [accountCustomer1Id, accountMerchantId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'unsuccessfully validate merchant pull request - merchant account in status pending', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, ACCOUNTSTATUSFAILURE, 'merchat account status does not allow transactions');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute merchant pull request - merchant account in status pending', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 6,
                            description: operationNameMerchantPullRequest
                        };
                    }, (error, assert) => {
                        assert.equals(error.type, ACCOUNTSTATUSFAILURE, 'merchat account status does not allow transactions');
                    }),
                    userMethods.logout('logout merchant 5', context => context['login merchant 5']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.rejectAccount('reject sender account 2', context => accountMerchantId1),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login merchant 6', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.validate', 'unsuccessfully validate merchant pull request - merchant account in status rejected', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, ACCOUNTSTATUSFAILURE, 'merchat account status does not allow transactions');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute merchant pull request - merchant account in status rejected', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 6,
                            description: operationNameMerchantPullRequest
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, ACCOUNTSTATUSFAILURE, 'merchat account status does not allow transactions');
                    }),
                    userMethods.logout('logout merchant 6', context => context['login merchant 6']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances in all accounts are unchanged after the failed pull requests
                    accountMethods.getAccountBalance('get customer account balance 6', context => accountCustomer1Id, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get merchant account balance 6', context => accountMerchantId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fsee account balance 6', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 6', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 6', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.discardAccount('discard changes in merchant accounts', context => {
                        return {
                            ownerId: context['add merchant'].person.actorId
                        };
                    }),
                    /** Scenarios for customer account in status different from approved - merchant pull request does not validate the source account status, only the  destination/merchant account */
                    commonFunc.createStep('ledger.account.edit', 'edit customer account', context => {
                        return {
                            account: {
                                accountId: accountCustomer1Id,
                                accountName: ACCOUNTNAME + '1updated',
                                accountNumber: accountCustomer1Number,
                                ownerId: customer1ActorId,
                                productId: context['add customer product'].product[0].productId,
                                stateId: context['add customer 1 account'].account[0].stateId,
                                businessUnitId: orgId1
                            },
                            accountPerson: {
                                accountId: accountCustomer1Id,
                                personId: customer1ActorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + '1updated', 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login merchant 7', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts',
                        context => [accountCustomer1Id, accountMerchantId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute merchant pull request - customer account pending', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 7,
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                    }),
                    userMethods.logout('logout merchant 7', context => context['login merchant 7']['identity.check'].sessionId),
                    userMethods.login('login customer 4', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully approve merchant payment - customer account in status pending', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request - customer account pending'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 'pendingcustacc',
                            pullTransferStatus: APPROVETRANSACTION
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, ACCOUNTSTATUSFAILURE, 'customer account status does not allow transactions');
                    }),
                    userMethods.logout('logout customer 4', context => context['login customer 4']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    /** Scenarios for rule limits - these limits are validated only on the merchant payment step (when the customer pays) */
                    accountMethods.approveAccount('approve edit of customer account', context => {
                        return {
                            accountId: accountCustomer1Id
                        };
                    }),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule for merchant payment - add minAmount limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 2
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: 'oc', // operation.id
                                itemNameId: operationIdMerchantPayment
                            }, {
                                conditionId: conditionId,
                                factor: 'sc', // source.account.product - customer
                                itemNameId: context['get customer product 2'].product[0].itemNameId
                            }, {
                                conditionId: conditionId,
                                factor: 'dc', // destination.account.product - merchant
                                itemNameId: context['get merchant product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
                                factor: 'co', // role
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
                                            name: 'Transfer amount',
                                            tag: '|merchant|'
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: CUSTOMERTOMERCHANTPERCENT, // 100 %
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: transferConstants.SOURCEACCOUNTNUMBER,
                                            credit: transferConstants.DESTINATIONACCOUNTNUMBER,
                                            percent: CUSTOMERTOMERCHANTPERCENT, // 100 %
                                            description: 'Transfer amount'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: '|acquirer|fee|'
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE, // 150
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: transferConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeMerchantPayment,
                                            percent: TRANSACTIONFEEPERCENT, // 100 %
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: '|fee|'
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: FEEBASEFORVATANDTAX, // 120
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeMerchantPayment,
                                            credit: opt.vatMerchantPayment,
                                            percent: FEETOVATPERCENT, // 10%
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: transferConstants.FEETYPE,
                                                value: transferConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeMerchantPayment,
                                            credit: opt.otherTaxMerchantPayment,
                                            percent: FEETOOTHERTAXPERCENT, // 15%
                                            description: 'Other fee - Transfer',
                                            splitAnalytic: {
                                                name: transferConstants.FEETYPE,
                                                value: transferConstants.OTHERTAX
                                            }
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                        assert.equals(result.limit[0].minAmount, TRANSFERAMOUNT, 'return correct minAmount limit');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login merchant 8', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.execute', 'successfully execute merchant pull request - transfer amount is less than minAmount limit', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 9,
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT - SMALLESTNUM, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute merchant pull request - transfer amount is less than minAmount limit 1', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 10,
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT - SMALLESTNUM, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute merchant pull request - to be reversed', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 11,
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                    }),
                    userMethods.logout('logout merchant 8', context => context['login merchant 8']['identity.check'].sessionId),
                    userMethods.login('login customer 5', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully approve merchant payment - transfer amount is less than minAmount limit', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request - transfer amount is less than minAmount limit'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '9a',
                            pullTransferStatus: APPROVETRANSACTION
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, MINLIMITAMOUNTFAILURE, 'Transaction amount is below minimum');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully reject merchant payment - transfer amount is less than minAmount limit', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request - transfer amount is less than minAmount limit 1'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '9b',
                            pullTransferStatus: REJECTTRANSACTION
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT - SMALLESTNUM, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                    }),
                    userMethods.logout('logout customer 5', context => context['login customer 5']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the balances in all accounts are unchanged after the failed requests
                    accountMethods.getAccountBalance('get customer account balance 7', context => accountCustomer1Id, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get merchant account balance 7', context => accountMerchantId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fsee account balance 7', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 7', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 7', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule for merchant payment - remove limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 2
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: 'oc', // operation.id
                                itemNameId: operationIdMerchantPayment
                            }, {
                                conditionId: conditionId,
                                factor: 'sc', // source.account.product - customer
                                itemNameId: context['get customer product 2'].product[0].itemNameId
                            }, {
                                conditionId: conditionId,
                                factor: 'dc', // destination.account.product - merchant
                                itemNameId: context['get merchant product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
                                factor: 'co', // role
                                actorId: roleMobileClientId
                            }],
                            split: {
                                data: {
                                    rows: [{
                                        splitName: {
                                            name: 'Transfer amount',
                                            tag: '|merchant|'
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: CUSTOMERTOMERCHANTPERCENT, // 100 %
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: transferConstants.SOURCEACCOUNTNUMBER,
                                            credit: transferConstants.DESTINATIONACCOUNTNUMBER,
                                            percent: CUSTOMERTOMERCHANTPERCENT, // 100 %
                                            description: 'Transfer amount'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee',
                                            tag: '|acquirer|fee|'
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: TRANSACTIONFEE, // 150
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: transferConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeMerchantPayment,
                                            percent: TRANSACTIONFEEPERCENT, // 100 %
                                            description: 'Transfer fee'
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer fee - GL',
                                            tag: '|fee|'
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: FEEBASEFORVATANDTAX, // 120
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeMerchantPayment,
                                            credit: opt.vatMerchantPayment,
                                            percent: FEETOVATPERCENT, // 10%
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: transferConstants.FEETYPE,
                                                value: transferConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeMerchantPayment,
                                            credit: opt.otherTaxMerchantPayment,
                                            percent: FEETOOTHERTAXPERCENT, // 15%
                                            description: 'Other fee - Transfer',
                                            splitAnalytic: {
                                                name: transferConstants.FEETYPE,
                                                value: transferConstants.OTHERTAX
                                            }
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                    }),
                    /** Scenario for reversal */
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login customer 6', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.execute', 'successfully approve merchant payment - to be reversed', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request - to be reversed'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '10a',
                            pullTransferStatus: APPROVETRANSACTION
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                    }),
                    userMethods.logout('logout customer 5', context => context['login customer 5']['identity.check'].sessionId),
                    userMethods.login('login teller 1', TELLERUSERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                    commonFunc.createStep('transaction.reverse', 'successfully reverse merchant payment', (context) => {
                        return {
                            transferId: context['successfully approve merchant payment - to be reversed'].transferId
                        };
                    }, (result, assert) => {
                        assert.equals(result.success, true, 'return successs');
                    }),
                    userMethods.logout('logout teller 1', context => context['login teller 1']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the transferred amounts are reversed
                    accountMethods.getAccountBalance('get customer account balance 2', context => accountCustomer1Id, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get merchant account balance 2', context => accountMerchantId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 2', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 2', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 2', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    /** Scenarios with product which is with min and max account balance */
                    productMethods.editProduct('edit customer product - set min and max account balances', context => {
                        return {
                            productId: context['get customer product 2'].product[0].productId,
                            minAccountBalance: MINACCOUNTBALANCE,
                            maxAccountBalance: MAXACCOUNTBALANCE
                        };
                    }),
                    productMethods.getProduct('get customer product', (context) => context['add customer product'].product[0].productId),
                    productMethods.approveProduct('approve customer product after edit', context => {
                        return {
                            productId: context['add customer product'].product[0].productId,
                            currentVersion: context['get customer product'].product[0].currentVersion
                        };
                    }),
                    productMethods.editProduct('edit merchant product - set min and max account balances', context => {
                        return {
                            productId: context['get merchant product 2'].product[0].productId,
                            minAccountBalance: MINACCOUNTBALANCE,
                            maxAccountBalance: MAXACCOUNTBALANCE
                        };
                    }),
                    productMethods.getProduct('get merchant product', (context) => context['add merchant product'].product[0].productId),
                    productMethods.approveProduct('approve merchant product after edit', context => {
                        return {
                            productId: context['add merchant product'].product[0].productId,
                            currentVersion: context['get merchant product'].product[0].currentVersion
                        };
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.login('login merchant 9', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    // customer product - less than product min account balance case
                    transferMethods.setBalance('set sender account balance less than product min account balance + transaction fee + transfer amount',
                        context => [accountCustomer1Id], commonFunc.roundNumber(MINACCOUNTBALANCE + TRANSACTIONFEEVALUE + TRANSFERAMOUNT - SMALLESTNUM, PRECISION)),
                    transferMethods.setBalance('set default balance in receiver, fee, vat and otherTax accounts',
                        context => [accountMerchantId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute merchant pull request 6', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 12,
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                    }),
                    userMethods.logout('logout merchant 9', context => context['login merchant 9']['identity.check'].sessionId),
                    userMethods.login('login customer 7', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully approve merchant payment - customer balance less than product min account balance', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 6'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '12a',
                            pullTransferStatus: APPROVETRANSACTION
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, ACCOUNTBALANCERESTRICTIONFAILURE, 'Customer account balance does not meet product limits.');
                    }),
                    userMethods.logout('logout customer 7', context => context['login customer 7']['identity.check'].sessionId),
                    userMethods.login('login merchant 10', userConstants.USERNAME, userConstants.USERPASSWORD, userConstants.TIMEZONE),
                    // merchant product - exceeding product max account balance case
                    transferMethods.setBalance('set merchant account balance more than product max account balance - transfer amount',
                        context => [accountMerchantId1], commonFunc.roundNumber(MAXACCOUNTBALANCE - TRANSFERAMOUNT + SMALLESTNUM, PRECISION)),
                    transferMethods.setBalance('set default balance in customer, fee, vat and otherTax accounts',
                        context => [accountCustomer1Id,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute merchant pull request 7', (context) => {
                        return {
                            transferType: operationeCodeMerchantPullRequest,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountCustomer1Number,
                            destinationAccount: accountMerchantNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 13,
                            description: operationNameMerchantPullRequest
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountCustomer1Number, 'return correct customer account number');
                        assert.equals(result.destinationAccount.accountNumber, accountMerchantNumber1, 'return correct merchant account number');
                    }),
                    userMethods.logout('logout merchant 10', context => context['login merchant 10']['identity.check'].sessionId),
                    userMethods.login('login customer 8', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully approve merchant payment - merchant balance more than product max account balance', (context) => {
                        return {
                            transferType: operationeCodeMerchantPayment,
                            pullTransferId: context['successfully execute merchant pull request 7'].transferId,
                            transferIdAcquirer: TRANSFERIDACQUIRER + '13a',
                            pullTransferStatus: APPROVETRANSACTION
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, ACCOUNTBALANCERESTRICTIONFAILURE, 'Merchant account balance does not meet product limits.');
                    }),
                    userMethods.logout('logout customer 8', context => context['login customer 8']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get customer account balance 3', context => accountCustomer1Id, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get merchant account balance 3', context => accountMerchantId1, MAXACCOUNTBALANCE - TRANSFERAMOUNT + SMALLESTNUM, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 3', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 3', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 3', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT)
                ])
            );
        }
    }, cache);
};
