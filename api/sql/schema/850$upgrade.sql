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
