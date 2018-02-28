CREATE TABLE [transfer].[pending](
    [pendingId] [INT] IDENTITY(1000, 1) NOT NULL, -- id of the pending record
    [pullTransactionId] [BIGINT] NULL, -- id of the request TRANSACTION
    [pushTransactionId] [BIGINT] NULL, -- id of the payment TRANSACTION
    [securityCode] [VARCHAR](max) NULL, -- hashed security code
    [expireTime] [datetime] NULL, -- DATE WHEN pending record expires
    [attempts] [INT] NULL, -- payment attempts
    [status] [INT] NULL, -- status of the pending record
    [approvalAccountNumber] [VARCHAR](50) NULL, -- account number that can approve payment
    [reasonId] [BIGINT] NULL, -- cancel/reject reason id
    [description] [NVARCHAR](255) NULL, -- cancel/reject description
    [params] [NVARCHAR](max) NULL, -- hash FUNCTION
    [createdBy] [BIGINT] NULL, --the id of the user, that created the pneding TRANSACTION
    [updatedBy] [BIGINT] NULL, --the id of the user, that updated (approved, rejected, canceled) the pending TRANSACTION
    [updatedOn] [DATETIME2](7) NULL, -- the exact time the user updated the pending TRANSACTION record
    CONSTRAINT [pkTransferPending] PRIMARY KEY CLUSTERED ([PendingId] ASC),
    CONSTRAINT [fkTransferPending_PullTransactionId] FOREIGN KEY([pullTransactionId]) REFERENCES [transfer].[transfer] ([transferId]),
    CONSTRAINT [fkTransferPending_PushTransactionId] FOREIGN KEY([pushTransactionId]) REFERENCES [transfer].[transfer] ([transferId]),
    CONSTRAINT [fkTransferPending_ReasonId] FOREIGN KEY([reasonId]) REFERENCES [core].[itemName] ([itemNameId])
)
