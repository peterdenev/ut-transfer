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
const BANKACCOUNTNUMBER = '3148324032';
// Rule parameters
const AGENTTOBANKACCOUNTPERCENT = 100;
const TRANSACTIONFEE = 400;
const TRANSACTIONFEEPERCENT = 100;
const TRANSACTIONFEEVALUE = TRANSACTIONFEE * TRANSACTIONFEEPERCENT / 100;
const FEEBASEFORVATANDTAX = 250;
const FEETOVATPERCENT = 10;
const FEETOVATVALUE = FEEBASEFORVATANDTAX * FEETOVATPERCENT / 100;
const FEETOOTHERTAXPERCENT = 20;
const FEETOOTHERTAXVALUE = FEEBASEFORVATANDTAX * FEETOOTHERTAXPERCENT / 100;
const COMMISSIONBASE = 150;
const COMMISSIONPERCENT = 100;
// Balance parameters
const MINACCOUNTBALANCE = 2000;
const MAXACCOUNTBALANCE = 100000;
const PRECISION = transferConstants.PRECISION;
var SMALLESTNUM = transferConstants.SMALLESTNUM;
const MINACCOUNTOPENINGBALANCE = 200;
const DEFAULTCREDIT = 20000;
const TRANSFERAMOUNT = 2500;
const IMEI1 = (Math.floor(100000000000000 + Math.random() * 999999999999999)).toString();
const ACCOUNTNAME = accountConstants.ACCOUNTNAME;
var conditionId, orgId1, organizationDepthArray;
var currencyName1, priority;
var operationIdCashInBank, operationCodeCashInBank, operationNameCashInBank;
var customerTypeIndividual, agentActorId, agentActorId2, currencyId, category1, category2, productType, productTypeId, periodicFeeId, productGroup, productGroupId, roleMobileAgentId, roleMobileClientId, roleTellerId;
var accountId1, accountNumber1, accountId2, accountNumber2;
var stdPolicy;

// Customer can deposit money to their bank account by using a 3rd party Agent wallet.
module.exports = function() {
    return {
        type: 'integration',
        name: 'cash-in to bank account from 3rd party agent wallet',
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
                    var operationCashInBank = result.itemTranslationFetch.find(item => item.itemCode === transferConstants.CASHINBANK);
                    operationIdCashInBank = operationCashInBank.itemNameId;
                    operationCodeCashInBank = operationCashInBank.itemCode;
                    operationNameCashInBank = operationCashInBank.itemName;
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
                    commonFunc.createStep('customer.selfregister', 'self register agent', (context) => {
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
                        agentActorId = result.actorId;
                        assert.equals(result.success, true, 'return success: true');
                    }),
                    commonFunc.createStep('ledger.account.fetch', 'fetch default customer account', context => {
                        return {
                            filterBy: {
                                ownerId: agentActorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateFetchAccount(result.account).error, null, 'Return all details after fetching account');
                        productGroup = result.account[0].productGroup;
                        productType = result.account[0].productType;
                    }),
                    commonFunc.createStep('user.user.get', 'get agent details', (context) => {
                        return {
                            actorId: agentActorId
                        };
                    }, (result, assert) => {
                        assert.equals(customerJoiValidation.validateGetPerson(result.person, customerConstants.FIRSTNAME).error, null, 'return person');
                        assert.equals(result['user.hash'][0].identifier, PHONENUMBER, 'return username = customer phone number in user.hash');
                        roleMobileClientId = result.rolesPossibleForAssign.find(role => role.name === transferConstants.MOBILECLIENT && role.isAssigned === 1).roleId;
                        roleMobileAgentId = result.rolesPossibleForAssign.find(role => role.name === transferConstants.MOBILEAGENT).roleId;
                        roleTellerId = result.rolesPossibleForAssign.find(role => role.name === transferConstants.TELLER).roleId;
                    }),
                    commonFunc.createStep('user.user.edit', 'edit agent - change role', context => {
                        return {
                            hash: [{
                                actorId: context['get agent details'].user[0].actorId,
                                hashId: context['get agent details']['user.hash'][0].hashId,
                                identifier: context['get agent details']['user.hash'][0].identifier,
                                type: context['get agent details']['user.hash'][0].type
                            }],
                            person: {
                                actorId: context['get agent details'].user[0].actorId,
                                lastName: context['get agent details'].person.lastName,
                                firstName: context['get agent details'].person.firstName
                            },
                            user: [{
                                actorId: context['get agent details'].user[0].actorId,
                                primaryLanguageId: context['get agent details'].user[0].primaryLanguageId
                            }],
                            phone: [{
                                actorId: context['get agent details'].user[0].actorId,
                                phoneId: context['get agent details'].phone[0].phoneId,
                                phoneTypeId: context['get agent details'].phone[0].phoneTypeId,
                                phoneNumber: context['get agent details'].phone[0].phoneNumber,
                                mnoId: context['get agent details'].phone[0].mnoId,
                                statusId: context['get agent details'].phone[0].statusId,
                                isPrimary: context['get agent details'].phone[0].isPrimary
                            }],
                            grantedRoles: [roleMobileAgentId],
                            revokedRoles: [roleMobileClientId],
                            defaultRoleId: roleMobileAgentId,
                            policyId: context['get agent details']['policy.basic'][0].policyId
                        };
                    }, (result, assert) => {
                        assert.equals(result.rolesUnapproved[0].roleId, roleMobileAgentId, 'return role mobile agent');
                        assert.equals(userJoiValidation.validateAddUser(result.user ? result.user[0] : result.userUnapproved[0]).error, null, 'Return all user details after editing a user');
                        assert.equals(userJoiValidation.validateGetRolesPossibleForAssign(result.rolesPossibleForAssign).error, null, 'Return all possible for assign roles after editing a user');
                        assert.equals(userJoiValidation.validatePolicyCredentials(result['policy.credentials']).error, null, 'Return policy.credentials after editing a user');
                        assert.equals(userJoiValidation.validatePolicy(result['policy.basic'][0]).error, null, 'Return policy after editing a user');
                    }),
                    userMethods.approveUser('approve agent', context => context['get agent details'].user[0].actorId),
                    commonFunc.createStep('ledger.userAccountByPhoneNumber.get', 'get account by phone number', context => {
                        return {
                            phoneNumber: PHONENUMBER
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateGetUserAccountByPhoneNumber(result).error, null, 'return correct details for customer accounts by phone number');
                    }),
                    commonFunc.createStep('customer.selfregister', 'self register agent 2', (context) => {
                        return {
                            uri: customerConstants.SELFREGURI,
                            firstName: customerConstants.FIRSTNAME + 'second',
                            lastName: customerConstants.LASTNAME,
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
                        agentActorId2 = result.actorId;
                        assert.equals(result.success, true, 'return success: true');
                    }),
                    commonFunc.createStep('user.user.get', 'get agent 2 details', (context) => {
                        return {
                            actorId: agentActorId2
                        };
                    }, (result, assert) => {
                        assert.equals(customerJoiValidation.validateGetPerson(result.person, customerConstants.FIRSTNAME + 'second').error, null, 'return person');
                        assert.equals(result['user.hash'][0].identifier, PHONENUMBER + '2', 'return username = customer phone number in user.hash');
                    }),
                    commonFunc.createStep('user.user.edit', 'edit agent 2 - change role', context => {
                        return {
                            hash: [{
                                actorId: context['get agent 2 details'].user[0].actorId,
                                hashId: context['get agent 2 details']['user.hash'][0].hashId,
                                identifier: context['get agent 2 details']['user.hash'][0].identifier,
                                type: context['get agent 2 details']['user.hash'][0].type
                            }],
                            person: {
                                actorId: context['get agent 2 details'].user[0].actorId,
                                lastName: context['get agent 2 details'].person.lastName,
                                firstName: context['get agent 2 details'].person.firstName
                            },
                            user: [{
                                actorId: context['get agent 2 details'].user[0].actorId,
                                primaryLanguageId: context['get agent 2 details'].user[0].primaryLanguageId
                            }],
                            phone: [{
                                actorId: context['get agent 2 details'].user[0].actorId,
                                phoneId: context['get agent 2 details'].phone[0].phoneId,
                                phoneTypeId: context['get agent 2 details'].phone[0].phoneTypeId,
                                phoneNumber: context['get agent 2 details'].phone[0].phoneNumber,
                                mnoId: context['get agent 2 details'].phone[0].mnoId,
                                statusId: context['get agent 2 details'].phone[0].statusId,
                                isPrimary: context['get agent 2 details'].phone[0].isPrimary
                            }],
                            grantedRoles: [roleMobileAgentId],
                            revokedRoles: [roleMobileClientId],
                            defaultRoleId: roleMobileAgentId,
                            policyId: context['get agent 2 details']['policy.basic'][0].policyId
                        };
                    }, (result, assert) => {
                        assert.equals(result.rolesUnapproved[0].roleId, roleMobileAgentId, 'return role mobile agent');
                        assert.equals(userJoiValidation.validateAddUser(result.user ? result.user[0] : result.userUnapproved[0]).error, null, 'Return all user details after editing a user');
                        assert.equals(userJoiValidation.validateGetRolesPossibleForAssign(result.rolesPossibleForAssign).error, null, 'Return all possible for assign roles after editing a user');
                        assert.equals(userJoiValidation.validatePolicyCredentials(result['policy.credentials']).error, null, 'Return policy.credentials after editing a user');
                        assert.equals(userJoiValidation.validatePolicy(result['policy.basic'][0]).error, null, 'Return policy after editing a user');
                    }),
                    userMethods.approveUser('approve agent 2', context => context['get agent 2 details'].user[0].actorId),
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
                                ownerId: agentActorId,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: agentActorId
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
                                ownerId: agentActorId2,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1,
                                accountName: ACCOUNTNAME + '2'
                            },
                            accountPerson: {
                                accountId: -1,
                                personId: agentActorId2
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(accountJoiValidation.validateAddAccount(result).error, null, 'Return all details after adding an account');
                        accountId2 = result.account[0].accountId;
                        accountNumber2 = result.account[0].accountNumber;
                    }),
                    accountMethods.approveAccount('approve adding of account 1', context => {
                        return {
                            accountId: accountId2
                        };
                    }),
                    accountMethods.fetchAccount('fetch fee account id', context => {
                        return {
                            accountNumber: opt.feeCashInBankAccountAtAgentWallet
                        };
                    }),
                    accountMethods.fetchAccount('fetch vat account id', context => {
                        return {
                            accountNumber: opt.vatCashInBankAccountAtAgentWallet
                        };
                    }),
                    accountMethods.fetchAccount('fetch otherTax account id', context => {
                        return {
                            accountNumber: opt.otherTaxCashInBankAccountAtAgentWallet
                        };
                    }),
                    /** RULE SETUP
                     * @conditionItem @conditionActor - used to define permissions for the transaction (which role, product, transaction type)
                     * @splitRange - defines the amount which will be splitted between the different accounts.
                     * The split range amount may be defined as "percent" (percent of the transaction amount) OR minValue(amount which is not calculated from the transaction amount)
                     * @splitAssignment - defines the way in which the amount in the split range will be splitted between the different accounts.
                     */
                    commonFunc.createStep('db/rule.rule.add', 'add rule - cash in to bank account at agent wallet', (context) => {
                        return {
                            condition: {
                                priority: priority - 1
                            },
                            conditionItem: [{
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashInBank
                            }, {
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileAgentId
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
                                            percent: AGENTTOBANKACCOUNTPERCENT, // 100 % of the amount defined in transaction.execute
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            // Pulls funds from the agent's wallet account and sends them to the customer's bank account.
                                            // The sent amount is percent(AGENTTOBANKACCOUNTPERCENT) of the transferred amount defined in transaction.execute
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            percent: AGENTTOBANKACCOUNTPERCENT, // 100%
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
                                            // Pulls funds from the agent wallet account and sends them to the GL fee account.
                                            // The sent amount is percent of the amount defined in the split range (TRANSACTIONFEEPERCENT * TRANSACTIONFEE / 100)
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashInBankAccountAtAgentWallet,
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
                                            minValue: FEEBASEFORVATANDTAX,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            // Pulls funds from the GL fee account and send them to the GL vat account.
                                            // The sent amount is percent of the amount defined in the split range (FEETOVATPERCENT * FEEBASEFORVATANDTAX / 100)
                                            debit: opt.feeCashInBankAccountAtAgentWallet,
                                            credit: opt.vatCashInBankAccountAtAgentWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            // Pulls funds from the GL fee account and sends them to the GL other tax account.
                                            // The sent amount is percent of the amount defined in the split range (FEETOOTHERTAXPERCENT * FEEBASEFORVATANDTAX / 100)
                                            debit: opt.feeCashInBankAccountAtAgentWallet,
                                            credit: opt.otherTaxCashInBankAccountAtAgentWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer commision - agent',
                                            tag: ruleConstants.AGENTCOMMISSIONPENDINGTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: COMMISSIONBASE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.commissionCashInBankAccountAtAgentWallet,
                                            credit: ruleConstants.CHANNELID,
                                            percent: COMMISSIONPERCENT, // 100%
                                            description: 'Transfer amount',
                                            splitAnalytic: [{
                                                name: ruleConstants.AGENTID,
                                                value: ruleConstants.CHANNELID
                                            }, {
                                                name: ruleConstants.STATUSID,
                                                value: 1
                                            }]
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
                    commonFunc.createStep('identity.check', 'login agent 1', (context) => {
                        return {
                            username: PHONENUMBER,
                            password: context['self register agent'].token,
                            newPassword: userConstants.ADMINPASSWORD,
                            uri: userConstants.URI,
                            timezone: userConstants.TIMEZONE,
                            channel: userConstants.MOBCHANNEL
                        };
                    }, (result, assert) => {
                        assert.equals(userJoiValidation.validateLogin(result['identity.check']).error, null, 'Return all details after login a user');
                    }),
                    /** Scenarios for product which is with min account balance */
                    transferMethods.setBalance('set agent account balance less than product min account balance + transaction fee + transfer amount',
                        context => [accountId1], commonFunc.roundNumber(MINACCOUNTBALANCE + TRANSACTIONFEEVALUE + TRANSFERAMOUNT - SMALLESTNUM, PRECISION)),
                    transferMethods.setBalance('set default balance in fee, vat, otherTax and commission accounts',
                        context => [context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - insufficient balance in sender account', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Insufficient balance in sender account');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cashIn to bank account at agent - insufficient balance in sender account', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 1,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.ACCOUNTBALANCERESTRICTIONFAILURE, 'Insufficient balance in sender account');
                    }),
                    transferMethods.setBalance('set sender account balance equal to product min account balance + transaction fee + transfer amount',
                        context => accountId1, commonFunc.roundNumber(MINACCOUNTBALANCE + TRANSACTIONFEEVALUE + TRANSFERAMOUNT, PRECISION)),
                    commonFunc.createStep('transaction.validate', 'successful transaction validation - sufficient balance in sender account', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            description: operationNameCashInBank
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after validating transaction');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountNumber1, 'return correct source account number');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.destinationAccount.accountNumber, BANKACCOUNTNUMBER, 'return correct destination account number');
                        assert.equals(result.transferType, operationCodeCashInBank, 'return correct transferType');
                        assert.equals(result.description, operationNameCashInBank, 'return correct description');
                        assert.equals(result.currency, currencyName1, 'return correct currency');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute cashIn to bank account at agent - sufficient balance in sender account', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 2,
                            description: operationNameCashInBank
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 2, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationCodeCashInBank, 'return correct transferType');
                    }),
                    userMethods.logout('logout agent 1', context => context['login agent 1']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get agent account balance 1', context => accountId1, MINACCOUNTBALANCE),
                    accountMethods.getAccountBalance('get fee account balance 1', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 1', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 1', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    /** Scenario with rule limit */
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - add minAmount limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashInBank
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileAgentId
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
                                            tag: ruleConstants.ACQUIRERTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            percent: AGENTTOBANKACCOUNTPERCENT, // 100 % of the amount defined in transaction.execute
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            percent: AGENTTOBANKACCOUNTPERCENT, // 100%
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
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashInBankAccountAtAgentWallet,
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
                                            minValue: FEEBASEFORVATANDTAX,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeCashInBankAccountAtAgentWallet,
                                            credit: opt.vatCashInBankAccountAtAgentWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeCashInBankAccountAtAgentWallet,
                                            credit: opt.otherTaxCashInBankAccountAtAgentWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer commision - agent',
                                            tag: ruleConstants.AGENTCOMMISSIONPENDINGTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: COMMISSIONBASE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.commissionCashInBankAccountAtAgentWallet,
                                            credit: ruleConstants.CHANNELID,
                                            percent: COMMISSIONPERCENT, // 100%
                                            description: 'Transfer amount',
                                            splitAnalytic: [{
                                                name: ruleConstants.AGENTID,
                                                value: ruleConstants.CHANNELID
                                            }, {
                                                name: ruleConstants.STATUSID,
                                                value: 1
                                            }]
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
                    userMethods.loginMobile('login agent 2', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 1',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - amount less than rule minAmount limit', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MINLIMITAMOUNTERROR, 'Transaction amount is below minimum');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cashIn to bank account at agent - amount less than rule minAmount limit', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 3,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.MINLIMITAMOUNTERROR, 'Transaction amount is below minimum');
                    }),
                    commonFunc.createStep('transaction.validate', 'successful transaction validation - amount equal to rule minAmount limit', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            description: operationNameCashInBank
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateValidateTransaction(result).error, null, 'return all details after validating transaction');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountNumber, accountNumber1, 'return correct source account number');
                        assert.equals(result.destinationAccount.accountNumber, BANKACCOUNTNUMBER, 'return correct destination account number');
                    }),
                    commonFunc.createStep('transaction.execute', 'successfully execute cashIn to bank account at agent - amount equal to rule minAmount limit', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 4,
                            description: operationNameCashInBank
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                        assert.equals(result.transferIdAcquirer, TRANSFERIDACQUIRER + 4, 'return correct transferIdAcquirer');
                        assert.equals(result.transferType, operationCodeCashInBank, 'return correct transferType');
                    }),
                    userMethods.logout('logout agent 2', context => context['login agent 2']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get agent account balance 2', context => accountId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 2', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 2', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 2', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    commonFunc.createStep('db/rule.rule.edit', 'edit rule - remove limit', (context) => {
                        return {
                            condition: {
                                conditionId: conditionId,
                                priority: priority - 1
                            },
                            conditionItem: [{
                                conditionId: conditionId,
                                factor: ruleConstants.OPERATIONCATEGORY, // operation.id
                                itemNameId: operationIdCashInBank
                            }, {
                                conditionId: conditionId,
                                factor: ruleConstants.SOURCECATEGORY, // source.account.product
                                itemNameId: context['get product 2'].product[0].itemNameId
                            }],
                            conditionActor: [{
                                conditionId: conditionId,
                                factor: ruleConstants.CHANNELORGANIZATION, // role
                                actorId: roleMobileAgentId
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
                                            percent: AGENTTOBANKACCOUNTPERCENT, // 100 % of the amount defined in transaction.execute
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: ruleConstants.DESTINATIONACCOUNTNUMBER,
                                            percent: AGENTTOBANKACCOUNTPERCENT, // 100%
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
                                            debit: ruleConstants.SOURCEACCOUNTNUMBER,
                                            credit: opt.feeCashInBankAccountAtAgentWallet,
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
                                            minValue: FEEBASEFORVATANDTAX,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.feeCashInBankAccountAtAgentWallet,
                                            credit: opt.vatCashInBankAccountAtAgentWallet,
                                            percent: FEETOVATPERCENT,
                                            description: 'VAT fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.VAT
                                            }
                                        }, {
                                            debit: opt.feeCashInBankAccountAtAgentWallet,
                                            credit: opt.otherTaxCashInBankAccountAtAgentWallet,
                                            percent: FEETOOTHERTAXPERCENT,
                                            description: 'Other fee - Transfer',
                                            splitAnalytic: {
                                                name: ruleConstants.FEETYPE,
                                                value: ruleConstants.OTHERTAX
                                            }
                                        }]
                                    }, {
                                        splitName: {
                                            name: 'Transfer commision - agent',
                                            tag: ruleConstants.AGENTCOMMISSIONPENDINGTAG
                                        },
                                        splitRange: [{
                                            startAmount: 0,
                                            startAmountCurrency: currencyName1,
                                            minValue: COMMISSIONBASE,
                                            isSourceAmount: 0
                                        }],
                                        splitAssignment: [{
                                            debit: opt.commissionCashInBankAccountAtAgentWallet,
                                            credit: ruleConstants.CHANNELID,
                                            percent: COMMISSIONPERCENT, // 100%
                                            description: 'Transfer amount',
                                            splitAnalytic: [{
                                                name: ruleConstants.AGENTID,
                                                value: ruleConstants.CHANNELID
                                            }, {
                                                name: ruleConstants.STATUSID,
                                                value: 1
                                            }]
                                        }]
                                    }]
                                }
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(ruleJoiValidation.validateEditRule(result).error, null, 'Return all detals after edit rule');
                    }),
                     /** Negative scenarios with account status - transactions can be processed only with approved accounts */
                    commonFunc.createStep('ledger.account.edit', 'edit account 1', context => {
                        return {
                            account: {
                                accountId: accountId1,
                                accountName: ACCOUNTNAME + 'update',
                                accountNumber: accountNumber1,
                                ownerId: agentActorId,
                                productId: context['add product'].product[0].productId,
                                businessUnitId: orgId1
                            },
                            accountPerson: {
                                accountId: accountId1,
                                personId: agentActorId
                            }
                        };
                    }, (result, assert) => {
                        assert.equals(result.unapprovedAccount[0].accountName, ACCOUNTNAME + 'update', 'return correct accountName');
                        assert.equals(accountJoiValidation.validateEditAccount(result).error, null, 'return all detais after editing an account');
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login agent 3', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 2',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - agent account in status pending', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account pending');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cashIn to bank account at agent - agent account in status pending', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 5,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account pending');
                    }),
                    userMethods.logout('logout agent 3', context => context['login agent 3']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.rejectAccount('reject edit of account 1', context => accountId1),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login agent 4', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - agent account in status rejected', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account rejected');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cashIn to bank account at agent - agent account in status rejected', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT - SMALLESTNUM,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 5,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account rejected');
                    }),
                    userMethods.logout('logout agent 4', context => context['login agent 4']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get agent account balance 3', context => accountId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 3', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 3', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 3', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.discardAccount('discard changes in agent account', context => {
                        return {
                            ownerId: agentActorId
                        };
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login agent 5', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    /** Reversal scenario */
                    transferMethods.setBalance('set default balance in all accounts 3',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.execute', 'successfully execute cashIn to bank account at agent - to be reversed', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 7,
                            description: operationNameCashInBank
                        };
                    }, (result, assert) => {
                        assert.equals(transferJoiValidation.validateExecuteTransaction(result).error, null, 'return all details after executing transaction');
                        assert.equals(result.amount, TRANSFERAMOUNT, 'return correct amount');
                        assert.equals(result.sourceAccount.accountName, ACCOUNTNAME, 'return correct source account name');
                        assert.equals(result.fee, commonFunc.roundNumber(TRANSACTIONFEEVALUE, PRECISION), 'return correct fee');
                        assert.equals(result.otherFee, commonFunc.roundNumber(FEETOOTHERTAXVALUE, PRECISION), 'return correct otherFee');
                        assert.equals(result.vat, commonFunc.roundNumber(FEETOVATVALUE, PRECISION), 'return correct vat');
                    }),
                    userMethods.logout('logout agent 5', context => context['login agent 5']['identity.check'].sessionId),
                    userMethods.login('login teller', userConstants.USERNAME, userConstants.USERPASSWORD + 1, userConstants.TIMEZONE, userConstants.USERPASSWORD),
                    commonFunc.createStep('transaction.reverse.execute', 'unsuccessfully reverse transaction', (context) => {
                        return {
                            transferId: context['successfully execute cashIn to bank account at agent - to be reversed'].transferId
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.UNSUPPORTEDREVERSETYPEERROR, 'return failure - unsupported reverse type');
                    }),
                    userMethods.logout('logout teller', context => context['login teller']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    // verify that the transaction is not reversed
                    accountMethods.getAccountBalance('get agent account balance 4', context => accountId1, DEFAULTCREDIT - TRANSFERAMOUNT - TRANSACTIONFEEVALUE, PRECISION),
                    accountMethods.getAccountBalance('get fee account balance 4', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT + TRANSACTIONFEEVALUE - FEETOVATVALUE - FEETOOTHERTAXVALUE, PRECISION),
                    accountMethods.getAccountBalance('get vat account balance 4', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT + FEETOVATVALUE, PRECISION),
                    accountMethods.getAccountBalance('get otherTax account balance 4', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT + FEETOOTHERTAXVALUE, PRECISION),
                    /** Negative scenario for closed account */
                    transferMethods.setBalance('set agent wallet balance to 0',
                        context => accountId1, 0),
                    accountMethods.closeAccount('close account', context => [accountId1]),
                    accountMethods.approveAccount('approve close of account', context => {
                        return {
                            accountId: accountId1
                        };
                    }),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login agent 6', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    transferMethods.setBalance('set default balance in all accounts 4',
                        context => [accountId1,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'failed transaction validation - agent account closed', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account closed');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cashIn to bank account at agent - agent account closed', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            destinationAccount: BANKACCOUNTNUMBER,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 5,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission, account closed');
                    }),
                    userMethods.logout('logout agent 6', context => context['login agent 6']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get agent account balance 5', context => accountId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 5', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 5', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 5', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT),
                    userMethods.logout('logout admin', context => context.login['identity.check'].sessionId),
                    userMethods.loginMobile('login agent 7', PHONENUMBER, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    /** Negative scenario - agent tries to execute transaction from another agent's account */
                    transferMethods.setBalance('set default balance in all accounts 5',
                        context => [accountId1, accountId2,
                            context['fetch fee account id'].account[0].accountId,
                            context['fetch vat account id'].account[0].accountId,
                            context['fetch otherTax account id'].account[0].accountId], DEFAULTCREDIT),
                    commonFunc.createStep('transaction.validate', 'unsuccessful transaction validation - another agent account', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber2,
                            destinationAccount: BANKACCOUNTNUMBER,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cashIn to bank account at agent - another agent account', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber2,
                            destinationAccount: BANKACCOUNTNUMBER,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 6,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, transferConstants.TRANSACTIONPERMISSIONERROR, 'return failure - no permission');
                    }),
                    // Missing destination account
                    commonFunc.createStep('transaction.execute', 'unsuccessful transaction validation - missing destination account', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    commonFunc.createStep('transaction.execute', 'unsuccessfully execute cashIn to bank account at agent - missing destination account', (context) => {
                        return {
                            transferType: operationCodeCashInBank,
                            amount: TRANSFERAMOUNT,
                            sourceAccount: accountNumber1,
                            transferIdAcquirer: TRANSFERIDACQUIRER + 7,
                            description: operationNameCashInBank
                        };
                    }, null, (error, assert) => {
                        assert.equals(error.type, 'PortHTTP', 'return joi failure');
                    }),
                    userMethods.logout('logout agent 7', context => context['login agent 7']['identity.check'].sessionId),
                    userMethods.login('login', userConstants.ADMINUSERNAME, userConstants.ADMINPASSWORD, userConstants.TIMEZONE),
                    accountMethods.getAccountBalance('get agent account balance 6', context => accountId1, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get fee account balance 6', context => context['fetch fee account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get vat account balance 6', context => context['fetch vat account id'].account[0].accountId, DEFAULTCREDIT),
                    accountMethods.getAccountBalance('get otherTax account balance 6', context => context['fetch otherTax account id'].account[0].accountId, DEFAULTCREDIT)
                ])
            );
        }
    };
};
