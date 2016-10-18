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
