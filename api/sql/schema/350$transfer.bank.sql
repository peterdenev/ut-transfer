CREATE TABLE [transfer].[bank](
    swift VARCHAR(11) NOT NULL,
    bankName VARCHAR(100) NOT NULL,
    isDefault BIT NOT NULL DEFAULT(0),
    CONSTRAINT [pkTransferBank] PRIMARY KEY CLUSTERED (swift ASC)
)
