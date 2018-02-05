CREATE TABLE [transfer].[split]( -- table that stores all splits per transaction
    splitId bigint IDENTITY(1000,1) NOT NULL, -- the split Id
    transferId bigint NOT NULL, -- the id of the transaction
    conditionId INT, -- the rule id
    splitNameId INT, -- the id of the rule split
    debit VARCHAR(50) NOT NULL, -- the account number that will be debited
    credit VARCHAR(50) NOT NULL, -- the account number that will be credited
    amount MONEY, -- the amount of the split
    [description] VARCHAR(50) NOT NULL, -- split description
    tag VARCHAR(MAX), -- tags used to identify what the split record refers to (eg. fee, commission)
    [debitActorId] [bigint] NULL, -- id of the actor whose account will be debited
    [creditActorId] [bigint] NULL, -- id of the account whose account will be credited
    [debitItemId] [bigint] NULL, -- id of the item whose account will be credited
    [creditItemId] [bigint] NULL, -- id of the item whose account will be credited
    [state] [smallint] NULL, -- status of the split (eg. rejected, paid etc.)
    [transferIdPayment] [bigint] NULL, -- id of the transaction that paid the the split amount
    [commissionId] [bigint] NULL,
    CONSTRAINT [pkTransferSplit] PRIMARY KEY CLUSTERED ([splitId] ASC),
    CONSTRAINT [fkTransferSplit_TransferId] FOREIGN KEY ([transferId]) REFERENCES [transfer].[transfer] ([transferId]),
    CONSTRAINT [fkTransferSplit_transferIdPayment] FOREIGN KEY ([transferIdPayment]) REFERENCES [transfer].[transfer] ([transferId]),
    CONSTRAINT [fkTransferSplit_debitActorId] FOREIGN KEY ([debitActorId]) REFERENCES [core].[actor] ([actorId]),
    CONSTRAINT [fkTransferSplit_creditActorId] FOREIGN KEY ([creditActorId]) REFERENCES [core].[actor] ([actorId]),
    CONSTRAINT [fkTransferSplit_debitItemId] FOREIGN KEY ([debitItemId]) REFERENCES [core].[itemName] ([itemNameId]),
    CONSTRAINT [fkTransferSplit_creditItemId] FOREIGN KEY ([creditItemId]) REFERENCES [core].[itemName] ([itemNameId])
)
