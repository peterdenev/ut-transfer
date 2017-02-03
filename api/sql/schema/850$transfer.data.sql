MERGE INTO
    core.itemName AS target
USING
    (VALUES
        ('deposit','Deposit / cash in'),
        ('withdraw','Withdraw / cash out'),
        --('withdrawOtp','Withdraw with OTP'),
        ('transfer','Funds transfer to account'),
        --('transferOtp','Funds transfer with OTP'),
        ('balance','Balance enquiry'),
        ('ministatement','Mini statement enquiry'),
        ('topup', 'Top up'),
        ('bill', 'Bill payment'),
        --('sale', 'Sale'),
        --('sms', 'SMS registration'),
        --('changePin', 'PIN change'),
        --('loanDisburse', 'Loan disbursement'),
        --('loanRepay', 'Loan repayment'),
        --('forex', 'Foreign currency exchange'),
        ('agentMinistatement', 'Agent Ministatement'),
        ('agentFloatRequest', 'Agent Float Request'),
        ('agentBalance', 'Agent Balance'),
        ('commission', 'Commission'),
        ('fee', 'Fee')
    ) AS source (itemCode, itemName)
JOIN
	core.itemType t on t.alias='operation'
ON
    target.itemCode = source.itemCode
WHEN
    NOT MATCHED BY TARGET THEN
INSERT
    (itemTypeId, itemCode, itemName)
VALUES
    (t.itemTypeId, source.itemCode, source.itemName);
