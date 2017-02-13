IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'destinationId' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD destinationId varchar(50)
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE NAME = N'state' AND Object_ID = OBJECT_ID(N'transfer.event'))
BEGIN
  ALTER TABLE [transfer].[event] ADD [state] varchar(50)
END
