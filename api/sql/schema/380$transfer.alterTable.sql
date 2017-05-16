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
----

