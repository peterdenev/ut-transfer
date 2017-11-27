IF EXISTS(SELECT 1 FROM sys.columns WHERE [name] = N'phoneNumber' AND object_id = OBJECT_ID(N'transfer.pending'))
BEGIN
	EXEC sp_rename 'transfer.pending.phoneNumber', 'recipientPhoneNumber', 'COLUMN';
END

IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE [name] = N'senderPhoneNumber' AND object_id = OBJECT_ID(N'transfer.pending'))
BEGIN
	ALTER TABLE transfer.pending ADD senderPhoneNumber VARCHAR(50) NULL;
END

IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE [name] = N'reversalDateTime' AND object_id = OBJECT_ID(N'transfer.transfer'))
BEGIN
	ALTER TABLE transfer.transfer ADD reversalDateTime DATETIME NULL;
END