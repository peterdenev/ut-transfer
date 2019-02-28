---transfer.split/columns
IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'debitActorId' AND OBJECT_ID = OBJECT_ID(N'transfer.split') )
BEGIN
    ALTER TABLE [transfer].[split] ADD debitActorId BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'creditActorId' AND OBJECT_ID = OBJECT_ID(N'transfer.split') )
BEGIN
    ALTER TABLE [transfer].[split] ADD creditActorId BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'debitItemId' AND OBJECT_ID = OBJECT_ID(N'transfer.split') )
BEGIN
    ALTER TABLE [transfer].[split] ADD debitItemId BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'creditItemId' AND OBJECT_ID = OBJECT_ID(N'transfer.split') )
BEGIN
    ALTER TABLE [transfer].[split] ADD creditItemId BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'state' AND OBJECT_ID = OBJECT_ID(N'transfer.split') )
BEGIN
    ALTER TABLE [transfer].[split] ADD [state] SMALLINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'transferIdPayment' AND OBJECT_ID = OBJECT_ID(N'transfer.split') )
BEGIN
    ALTER TABLE [transfer].[split] ADD transferIdPayment BIGINT
END

---transfer.split/FKs
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkTransferSplit_transferIdPayment')
BEGIN
    ALTER TABLE [transfer].[split] ADD CONSTRAINT fkTransferSplit_transferIdPayment FOREIGN KEY ([transferIdPayment]) REFERENCES [transfer].[transfer] ([transferId])
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkTransferSplit_debitActorId')
BEGIN
    ALTER TABLE [transfer].[split] ADD CONSTRAINT fkTransferSplit_debitActorId FOREIGN KEY ([debitActorId]) REFERENCES [core].[actor] ([actorId])
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkTransferSplit_creditActorId')
BEGIN
    ALTER TABLE [transfer].[split] ADD CONSTRAINT fkTransferSplit_creditActorId FOREIGN KEY ([creditActorId]) REFERENCES [core].[actor] ([actorId])
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkTransferSplit_debitItemId')
BEGIN
    ALTER TABLE [transfer].[split] ADD CONSTRAINT fkTransferSplit_debitItemId FOREIGN KEY ([debitItemId]) REFERENCES [core].[itemName] ([itemNameId])
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkTransferSplit_creditItemId')
BEGIN
    ALTER TABLE [transfer].[split] ADD CONSTRAINT fkTransferSplit_creditItemId FOREIGN KEY ([creditItemId]) REFERENCES [core].[itemName] ([itemNameId])
END

---transfer.pending/FKs
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkTransferPending_FirstTransferId')
BEGIN
    ALTER TABLE [transfer].[pending] DROP CONSTRAINT fkTransferPending_FirstTransferId
END

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkTransferPending_SecondTransferId')
BEGIN
    ALTER TABLE [transfer].[pending] DROP CONSTRAINT fkTransferPending_SecondTransferId
END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'firstTransferId' AND OBJECT_ID = OBJECT_ID(N'transfer.pending') )
BEGIN
    EXEC sp_rename 'transfer.pending.firstTransferId', 'pullTransactionId', 'Column'
END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'secondTransferId' AND OBJECT_ID = OBJECT_ID(N'transfer.pending') )
BEGIN
    EXEC sp_rename 'transfer.pending.secondTransferId', 'pushTransactionId', 'Column'
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkTransferPending_PullTransactionId')
BEGIN
    ALTER TABLE [transfer].[pending] ADD CONSTRAINT fkTransferPending_PullTransactionId FOREIGN KEY([pullTransactionId]) REFERENCES [transfer].[transfer] ([transferId])
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkTransferPending_PushTransactionId')
BEGIN
    ALTER TABLE [transfer].[pending] ADD CONSTRAINT fkTransferPending_PushTransactionId FOREIGN KEY([pushTransactionId]) REFERENCES [transfer].[transfer] ([transferId])
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'approvalAccountNumber' AND OBJECT_ID = OBJECT_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD approvalAccountNumber VARCHAR (50)
END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'securityCode' AND OBJECT_ID = OBJECT_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ALTER COLUMN securityCode VARCHAR (max)
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'reasonId' AND OBJECT_ID = OBJECT_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD reasonId BIGINT
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkTransferPending_ReasonId')
BEGIN
    ALTER TABLE [transfer].[pending] ADD CONSTRAINT fkTransferPending_ReasonId FOREIGN KEY([reasonId]) REFERENCES [core].[itemName] ([itemNameId])
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'description' AND OBJECT_ID = OBJECT_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD [description] NVARCHAR (255)
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'params' AND OBJECT_ID = OBJECT_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD params NVARCHAR (max)
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'createdBy' AND OBJECT_ID = OBJECT_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD createdBy BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'updatedBy' AND OBJECT_ID = OBJECT_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD updatedBy BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'updatedOn' AND OBJECT_ID = OBJECT_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD updatedOn DATETIME2
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'initiatorName' AND OBJECT_ID = OBJECT_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD [initiatorName] [NVARCHAR](200)
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'credentialId' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer') )
BEGIN
    ALTER TABLE [transfer].[transfer] ADD credentialId VARCHAR(50)
END
IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'issuerId' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD issuerId VARCHAR(50)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'ledgerId' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD ledgerId VARCHAR(50)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'transferIdLedger' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD transferIdLedger VARCHAR(50)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'ledgerTxState' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD ledgerTxState SMALLINT
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'state' AND OBJECT_ID = OBJECT_ID(N'transfer.event'))
BEGIN
    ALTER TABLE [transfer].[event] ADD [state] VARCHAR(50)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'issuerSerialNumber' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD issuerSerialNumber BIGINT
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'retrievalReferenceNumber' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD retrievalReferenceNumber VARCHAR(12)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'reversedLedger' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD reversedLedger BIT
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'expireCountLedger' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD expireCountLedger INT
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'replacementAmount' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD replacementAmount money
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'replacementAmountCurrency' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD replacementAmountCurrency VARCHAR(3)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'actualAmount' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD actualAmount money
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'actualAmountCurrency' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD actualAmountCurrency VARCHAR(3)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'settlementAmount' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD settlementAmount money
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'settlementAmountCurrency' AND OBJECT_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD settlementAmountCurrency VARCHAR(3)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'processorFee' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD processorFee money
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'issuerRequestedDateTime' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD issuerRequestedDateTime DATETIME2
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'sourceAccountHolder' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD sourceAccountHolder NVARCHAR(200)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'destinationAccountHolder' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD destinationAccountHolder NVARCHAR(200)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'destinationBankName' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD destinationBankName NVARCHAR(100)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'SWIFT' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD SWIFT VARCHAR(11)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'additionalDetails' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
    ALTER TABLE [transfer].[transfer] ADD additionalDetails NVARCHAR(500)
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE Object_ID = OBJECT_ID(N'transfer.payee') AND is_primary_key = 1)
BEGIN
    ALTER TABLE [transfer].[payee] ADD CONSTRAINT pkTransferPayee PRIMARY KEY CLUSTERED (payeeId)
END
