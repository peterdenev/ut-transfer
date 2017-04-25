CREATE TABLE [transfer].[pending](
	[pendingId] [int] IDENTITY(1000,1) NOT NULL,
	[firstTransferId] [bigint] NULL,
	[secondTransferId] [bigint] NULL,
	[securityCode] [varchar](50) NULL,
	[expireTime] [datetime] NULL,
	[attempts] [int] NULL,
	[status] [int] NULL,
     customerNumber nvarchar(20) NULL,
     phoneNumber varchar(50) NULL,
    CONSTRAINT [pkTransferPending] PRIMARY KEY CLUSTERED ([PendingId] ASC),
    CONSTRAINT [fkTransferPending_FirstTransferId] FOREIGN KEY([firstTransferId]) REFERENCES [transfer].[transfer] ([transferId]),
    CONSTRAINT [fkTransferPending_SecondTransferId] FOREIGN KEY([secondTransferId]) REFERENCES [transfer].[transfer] ([transferId])
)
