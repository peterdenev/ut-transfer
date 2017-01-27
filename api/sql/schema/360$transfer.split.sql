CREATE TABLE [transfer].[split](
    splitId bigint IDENTITY(1000,1) NOT NULL,
    transferId bigint NOT NULL,
    conditionId INT,
    splitNameId INT,
    debit VARCHAR(50) NOT NULL,
    credit VARCHAR(50) NOT NULL,
    amount MONEY,
    [description] VARCHAR(50) NOT NULL,
    tag VARCHAR(MAX),
    actorId BIGINT NULL,
    CONSTRAINT [pkTransferSplit] PRIMARY KEY CLUSTERED ([splitId] ASC),
    CONSTRAINT [fkTransferSplit_TransferId] FOREIGN KEY([transferId]) REFERENCES [transfer].[transfer] ([transferId])
)
