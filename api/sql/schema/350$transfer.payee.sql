CREATE TABLE [transfer].[payee](
    payeeId BIGINT IDENTITY(1000, 1) NOT NULL,
    userId BIGINT NOT NULL,
    payeeName NVARCHAR(100),
    accountTypeId BIGINT,
    accountNumber VARCHAR(50),
    bankName VARCHAR(100),
    SWIFT VARCHAR(11),
    CONSTRAINT [fkTransferPayee_accountTypeId] FOREIGN KEY([accountTypeId]) REFERENCES [core].[itemName] ([itemNameId])
)
