IF NOT EXISTS( SELECT 1 FROM sys.columns WHERE Name = N'reversalAttempts' AND Object_ID = Object_ID(N'transfer.pending') )
BEGIN
    ALTER TABLE [transfer].pending ADD reversalAttempts int NULL
END

