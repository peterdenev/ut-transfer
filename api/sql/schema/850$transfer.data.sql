MERGE INTO
    core.itemName AS target
USING
    (VALUES
        -- ('deposit', 'Deposit / cash in'),
        -- ('withdraw', 'Withdrawal / cash out'),
        -- ('withdrawOtp', 'FMT - Fulfillment'), -- Withdraw with OTP
        ('transfer', 'P2P Transfer'),
        ('balance', 'Balance enquiry')
        -- ('ministatement', 'Mini Statement'),
        -- ('transferOtp', 'FMT - Account Option'), -- Funds transfer with OTP
        -- ('transferOtpCash', 'FMT - Cash Option'), -- Funds transfer with OTP - Cash option
        -- ('topup', 'Top up'),
        -- ('bill', 'Bill payment'),
		-- ('tvLicense', 'TV License'),
        --('sale', 'Sale'),
        --('sms', 'SMS registration'),
        --('changePin', 'PIN change'),
        --('loanDisburse', 'Loan disbursement'),
        --('loanRepay', 'Loan repayment'),
        --('forex', 'Foreign currency exchange'),
        -- ('agentMinistatement', 'Agent Mini Statement'),
        -- ('agentFloatRequest', 'Agent Float Request'),
        -- ('agentBalance', 'Agent Balance'),
        -- ('commission', 'Commission'),
        -- ('fee', 'Fee')
        -- ('airline', 'Airline ticket purchase'),
        -- ('glTransfer', 'GL Transfer'),
        -- ('transferOtpReverse', 'FMT Reversal') -- Funds transfer with OTP - Reverse
    ) AS source (itemCode, itemName)
JOIN
	core.itemType t on t.alias='operation'
ON
    target.itemCode = source.itemCode
WHEN MATCHED THEN UPDATE SET target.itemName = source.itemName
WHEN
    NOT MATCHED BY TARGET THEN
INSERT
    (itemTypeId, itemCode, itemName)
VALUES
    (t.itemTypeId, source.itemCode, source.itemName);
