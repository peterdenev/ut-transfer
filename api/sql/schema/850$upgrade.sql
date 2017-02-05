IF NOT EXISTS(SELECT * FROM sys.columns WHERE nAME = N'destinationId' AND Object_ID = OBJECT_ID(N'transfer.transfer'))
BEGIN
  ALTER TABLE [transfer].[transfer] ADD destinationId varchar(50)
END
