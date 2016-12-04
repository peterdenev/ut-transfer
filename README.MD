# UT Transfer

## Scope

### Integrations

Implement the business logic for reliable transfers, while integrating with the following modules:

* Anti Money Laundering module (ut-aml)
* Alerts and notifications module (ut-alert)
* Rules module (ut-rule)
* Core Banking System
* ATM module (ut-atm)
* POS module (ut-pos)
* Utility companies for bill payments
* Mobile Network Operators for top up
* EFT switches via ISO 8583
* Card transactions pre-processing module (ut-ctp)

### Transfer types

The following minimum set of transfer types should be supported:

* cash in / deposit
* cash out / withdrawal
* funds transfer / push transfer to own account
* funds transfer / push transfer to account to account in the same ledger
* funds transfer / push transfer to account to account in foreign ledger
* mobile airtime top up
* bill payment
* cheque deposit / payment / etc.
* loan disbursement
* loan repayment
* currency exchange
* group collection sheet
* sale
* receive money
* till transactions

### Pending transactions

### Standing / scheduled / periodic transactions

### Enquiries

* balance
* mini statement

### Reversals

### Reconciliation

### Settlement

### Store And Forward (SAF) / Stand-in mode

## API

Definitions

* Acquirer - the front end that captured the transfer parameters. Example:
  * agent application
  * teller application
  * end user application
  * ATM
  * POS
* Issuer - the institution of the account holder, ordering the transfer
  * local core banking system
  * remote core banking system
* Merchant - third party participating in the transfer. Examples:
  * MNO
  * electricity company
  * ISP
  * cable operator
  * retailer

### transfer.push.execute(params)

* params.transferType - type of the transfer, represented as predefined string
* params.transferIdAcquirer - id assigned to the transfer by the acquirer
* params.transferDateTime - the time transfer was recorded in the database
* params.settlementDate - the settlement date for the transfer
* params.channelId - actor id of the channel
* params.channelType - type of the channel: atm, pos, teller, agent,
* params.holderId - card holder (in case of card transaction)
* params.holderType -
* params.merchantId - actor id of the merchant
* params.merchantInvoice - identifier suitable to be sent to the merchant for processing the operation. In addition to invoice number, can also be phone number, contract numner, etc.
* params.merchantPort - port to which to send the transfer for fulfilling the merchant operation
* params.merchantType - type of merchant (for ISO use)
* params.cardId - card id of the card (in case of card transaction)
* params.sourceAccount - account number of the source account
* params.destinationAccount - account number of the destination account
* params.destinationPort - port to which to send the transfer for fulfilling the issuer operation
* params.transferCurrency - alphabetic currency code
* params.transferAmount - amount of the transfer
* params.acquirerFee - fee to be paid to the acquirer, debited from the source account in addition to the transfer amount
* params.issuerFee - fee to be paid to the issuer, debited from the source account in addition to the transfer amount
* params.transferFee - fee to be paid to the switch, debited from the source account in addition to the transfer amount
* params.description - text description for the transfer
* params.udfAcquirer - additional user defined fields related to the acquirer
* params.udfIssuer - additional user defined fields related to the issuer
* params.udfTransfer - additional user defined fields related to the transfer

Upon success returns similar object with the following additional fields:

* params.transferId - id assigned to the transfer in the transfer module database
* result.localDateTime - same as transferDateTime, but formatted as YYYYMMDDhhmmss
* result.balance - balance of the source account after successful completion
* params.transferIdIssuer - id assigned to the transfer by the issuer
* params.transferIdMerchant - id assigned to the transfer by the merchant

In addition the following fields are maintained in the database

* expireTime - time at which the transfer can be reversed if not yet completed
* expireCount - number of reversal attempts
* reversed - set to 1 for reversed accounts
* retryTime - time of the last retry (store and forward)
* retryCount - count of retries (store and forward)
* issuerTxState - transfer state at issuer
* acquirerTxState - transfer state at acquirer
* merchantTxState - transfer state at merchant
* params.issuerErrorType - error type that happened when executing the operation at the issuer
* params.issuerErrorMessage - error message returned when the executing the operation at the issuer
* params.reversalErrorType - error type that happened when reversing the operation at the issuer
* params.reversalErrorMessage - error message returned when the reversing the operation at the issuer
* params.acquirerErrorType - error type that happened when executing the operation at the acquirer
* params.acquirerErrorMessage - error message returned when the executing the operation at the acquirer
* params.merchantErrorType - error type that happened when processing at the merchant
* params.merchantErrorMessage - error message returned when the executing the operation at the merchant
