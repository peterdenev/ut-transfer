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
    [state] SMALLINT NULL, -- 4 --> authorized, 1 --> requested, 2 --> processed, 6 --> failed
    txtId BIGINT NULL, -- transferId of the transaction that payed commission
    CONSTRAINT [pkTransferSplit] PRIMARY KEY CLUSTERED ([splitId] ASC),
    CONSTRAINT [fkTransferSplit_TransferId] FOREIGN KEY([transferId]) REFERENCES [transfer].[transfer] ([transferId]),
    CONSTRAINT fkTransferSplit_actorId FOREIGN KEY (actorId) REFERENCES [core].[actor] (actorId),
    CONSTRAINT [fkTransferSplit_txtId] FOREIGN KEY(txtId) REFERENCES [transfer].[transfer] ([transferId])
)
