---transfer.split/columns
IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'debitActorId' AND Object_ID = Object_ID(N'transfer.split') )
BEGIN
    ALTER TABLE [transfer].[split] ADD debitActorId BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'creditActorId' AND Object_ID = Object_ID(N'transfer.split') )
BEGIN
    ALTER TABLE [transfer].[split] ADD creditActorId BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'debitItemId' AND Object_ID = Object_ID(N'transfer.split') )
BEGIN
    ALTER TABLE [transfer].[split] ADD debitItemId BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'creditItemId' AND Object_ID = Object_ID(N'transfer.split') )
BEGIN
    ALTER TABLE [transfer].[split] ADD creditItemId BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'state' AND Object_ID = Object_ID(N'transfer.split') )
BEGIN
    ALTER TABLE [transfer].[split] ADD [state] SMALLINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'transferIdPayment' AND Object_ID = Object_ID(N'transfer.split') )
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

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'firstTransferId' AND Object_ID = Object_ID(N'transfer.pending') )
BEGIN
    EXEC sp_rename 'transfer.pending.firstTransferId', 'pullTransactionId', 'Column'
END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'secondTransferId' AND Object_ID = Object_ID(N'transfer.pending') )
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

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'approvalAccountNumber' AND Object_ID = Object_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD approvalAccountNumber VARCHAR (50)
END

IF EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'securityCode' AND Object_ID = Object_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ALTER COLUMN securityCode VARCHAR (max)
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'reasonId' AND Object_ID = Object_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD reasonId BIGINT
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fkTransferPending_ReasonId')
BEGIN
    ALTER TABLE [transfer].[pending] ADD CONSTRAINT fkTransferPending_ReasonId FOREIGN KEY([reasonId]) REFERENCES [core].[itemName] ([itemNameId])
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'description' AND Object_ID = Object_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD [description] NVARCHAR (255)
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'params' AND Object_ID = Object_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD params NVARCHAR (max)
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'createdBy' AND Object_ID = Object_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD createdBy BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'updatedBy' AND Object_ID = Object_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD updatedBy BIGINT
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'updatedOn' AND Object_ID = Object_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].[pending] ADD updatedOn datetime2
END

IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'credentialId' AND Object_ID = Object_ID(N'transfer.transfer') )
BEGIN
    ALTER TABLE [transfer].[transfer] ADD credentialId varchar(50)
END
IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'issuerId' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD issuerId varchar(50)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'ledgerId' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD ledgerId varchar(50)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'transferIdLedger' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD transferIdLedger varchar(50)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'ledgerTxState' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD ledgerTxState smallint
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'state' AND Object_ID = OBJECT_ID(N'transfer.event'))
BEGIN
  ALTER TABLE [transfer].[event] ADD [state] varchar(50)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'issuerSerialNumber' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD issuerSerialNumber bigint
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'retrievalReferenceNumber' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD retrievalReferenceNumber varchar(12)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'reversedLedger' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD reversedLedger bit
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'expireCountLedger' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD expireCountLedger int
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'replacementAmount' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD replacementAmount money
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'replacementAmountCurrency' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD replacementAmountCurrency varchar(3)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'actualAmount' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD actualAmount money
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'actualAmountCurrency' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD actualAmountCurrency varchar(3)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'settlementAmount' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD settlementAmount money
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'settlementAmountCurrency' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD settlementAmountCurrency varchar(3)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'processorFee' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD processorFee money
END