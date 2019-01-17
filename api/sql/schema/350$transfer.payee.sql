CREATE TABLE [transfer].[payee](
    payeeId BIGINT IDENTITY(1000, 1) NOT NULL,
    userId BIGINT NOT NULL,
    payeeName NVARCHAR(100) NOT NULL,
    accountTypeId BIGINT NOT NULL,
    accountNumber VARCHAR(50) NOT NULL,
    bankName VARCHAR(100) NOT NULL,
    SWIFT VARCHAR(11) NOT NULL,
    isDeleted BIT NOT NULL DEFAULT(0),
    CONSTRAINT [pkTransferPayee] PRIMARY KEY CLUSTERED (payeeId ASC),
    CONSTRAINT [fkTransferPayee_accountTypeId] FOREIGN KEY([accountTypeId]) REFERENCES [core].[itemName] ([itemNameId])
)
