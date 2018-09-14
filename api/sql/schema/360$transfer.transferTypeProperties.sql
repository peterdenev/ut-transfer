CREATE TABLE [transfer].[transferTypeProperties](
    transferTypePropertiesId INT IDENTITY(1,1) NOT NULL,
    transferType NVARCHAR(200),
    debitAccount NVARCHAR(200),
    creditAccount NVARCHAR(200),
    CONSTRAINT [pkTransferTypePropertiesId] PRIMARY KEY CLUSTERED ([transferTypePropertiesId] ASC)
)
