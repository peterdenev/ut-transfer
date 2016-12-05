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

* **Acquirer** - the front end that captured the transfer parameters, for example:
  * agent application
  * teller application
  * end user application
  * ATM
  * POS
* **Issuer** - the institution of the account holder of the source account of the transfer, for example:
  * local core banking system
  * remote core banking system
* **Merchant** - third party participating in the transfer, for example:
  * MNO
  * electricity company
  * ISP
  * cable operator
  * retailer

### transfer.push.execute(params)

* **params.transferTypeId** - type of the transfer. Transfer types are items in the **core.itemName** table, with itemTypeId pointing to table **core.itemType** and row with alias='operation'. The follwing values for **core.itemName.itemTypeCode** are predefined:
  * **deposit** - Deposit / cash in
  * **withdraw** - Withdraw / cash out
  * **withdrawOtp** - Withdraw with OTP
  * **transfer** - Funds transfer to account
  * **transferOtp** - Funds transfer with OTP
  * **balance** - Balance enquiry
  * **ministatement** - Mini statement enquiry
  * **topup** - Top up
  * **bill** - Bill payment
  * **sale** - Sale
  * **sms** - SMS registration
  * **changePin** - PIN change
  * **loanDisburse** - Loan disbursement
  * **loanRepay** - Loan repayment
  * **forex** - Foreign currency exchange
* **params.transferIdAcquirer** - id assigned to the transfer by the acquirer
* **params.transferDateTime** - the time transfer was recorded in the database
* **params.settlementDate** - the settlement date for the transfer
* **params.channelId** - actor id of the channel
* **params.channelType** - type of the channel: atm, pos, teller, agent,
* **params.ordererId** - id of the actor ordering the transaction. In case of card transaction this is the card holder.
* **params.merchantId** - actor id of the merchant
* **params.merchantInvoice** - identifier suitable to be sent to the merchant for processing the operation. In addition to invoice number, can also be phone number, contract numner, etc.
* **params.merchantPort** - port to which to send the transfer for fulfilling the merchant operation
* **params.merchantType** - type of merchant (for ISO use)
* **params.cardId** - card id of the card (in case of card transaction)
* **params.sourceAccount** - account number of the source account
* **params.destinationAccount** - account number of the destination account
* **params.destinationPort** - port to which to send the transfer for fulfilling the issuer operation
* **params.transferCurrency** - alphabetic currency code
* **params.transferAmount** - amount of the transfer
* **params.acquirerFee** - fee to be paid to the acquirer, debited from the source account in addition to the transfer amount
* **params.issuerFee** - fee to be paid to the issuer, debited from the source account in addition to the transfer amount
* **params.transferFee** - fee to be paid to the switch, debited from the source account in addition to the transfer amount
* **params.description** - text description for the transfer
* **params.udfAcquirer** - additional user defined fields related to the acquirer. Example of such fields are:
    * **terminalId** - ATM/POS terminal id, ISO 8583 field 41
    * **identificationCode** - ISO 8583 field 42r
    * **terminalName** - name and location of the terminal, ISO 8583 field 43
    * **opcode** - ATM operation code buffer
    * **processingCode** - ISO 8583 field 3
    * **merchantType** - ISO 8583 field 18
    * **institutionCode** - ISO 8583 field 32
* **params.udfIssuer** - additional user defined fields related to the issuer
* **params.udfTransfer** - additional user defined fields related to the transfer

Upon success returns similar **result** object with the following additional fields:

* **result.transferId** - id assigned to the transfer in the transfer module database
* **result.transferTypeId** - id of the transfe type
* **result.localDateTime** - same as transferDateTime, but formatted as YYYYMMDDhhmmss
* **result.balance** - balance of the source account after successful completion
* **result.transferIdIssuer** - id assigned to the transfer by the issuer
* **result.transferIdMerchant** - id assigned to the transfer by the merchant

In addition the following fields are maintained in the database

* **expireTime** - time at which the transfer can be reversed if not yet completed
* **expireCount** - number of reversal attempts
* **reversed** - set to 1 for reversed accounts
* **retryTime** - time of the last retry (store and forward)
* **retryCount** - count of retries (store and forward)
* **issuerTxState** - transfer state at issuer
* **acquirerTxState** - transfer state at acquirer
* **merchantTxState** - transfer state at merchant
* **issuerErrorType** - error type that happened when executing the operation at the issuer
* **issuerErrorMessage** - error message returned when the executing the operation at the issuer
* **reversalErrorType** - error type that happened when reversing the operation at the issuer
* **reversalErrorMessage** - error message returned when the reversing the operation at the issuer
* **acquirerErrorType** - error type that happened when executing the operation at the acquirer
* **acquirerErrorMessage** - error message returned when the executing the operation at the acquirer
* **merchantErrorType** - error type that happened when processing at the merchant
* **merchantErrorMessage** - error message returned when the executing the operation at the merchant
