CREATE TABLE [transfer].[pending](
    [pendingId] [int] IDENTITY(1000,1) NOT NULL, -- id of the pending record
    [pullTransactionId] [bigint] NULL, -- id of the request transaction
    [pushTransactionId] [bigint] NULL, -- id of the payment transaction
    [securityCode] [varchar](max) NULL, -- hashed security code
    [expireTime] [datetime] NULL, -- date when pending record expires
    [attempts] [int] NULL, -- payment attempts
    [status] [int] NULL, -- status of the pending record
    [approvalAccountNumber] [varchar](50) NULL, -- account number that can approve payment
    [reasonId] [bigint] NULL, -- cancel/reject reason id
    [description] [nvarchar](255) NULL, -- cancel/reject description
    [params] [nvarchar](max) NULL, -- hash function
    [createdBy] [bigint] NULL, --the id of the user, that created the pneding transaction    
    [updatedBy] [bigint] NULL, --the id of the user, that updated (approved, rejected, canceled) the pending transaction
    [updatedOn] [datetime2](7) NULL,-- the exact time the user updated the pending transaction record
    CONSTRAINT [pkTransferPending] PRIMARY KEY CLUSTERED ([PendingId] ASC),
    CONSTRAINT [fkTransferPending_PullTransactionId] FOREIGN KEY([pullTransactionId]) REFERENCES [transfer].[transfer] ([transferId]),
    CONSTRAINT [fkTransferPending_PushTransactionId] FOREIGN KEY([pushTransactionId]) REFERENCES [transfer].[transfer] ([transferId]),
    CONSTRAINT [fkTransferPending_ReasonId] FOREIGN KEY([reasonId]) REFERENCES [core].[itemName] ([itemNameId])
)
