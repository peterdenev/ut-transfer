CREATE TABLE [transfer].[cardless](
	[cardlessId] [int] IDENTITY(1000,1) NOT NULL,
	[firstTransferId] [bigint] NULL,
	[secondTransferId] [bigint] NULL,
	[securityCode] [varchar](50) NULL,
	[expireTime] [datetime] NULL,
	[attempts] [int] NULL,
	[status] [int] NULL,
    CONSTRAINT [pkTransferCardless] PRIMARY KEY CLUSTERED ([cardlessId] ASC),
    CONSTRAINT [fkTransferCardless_FirstTransferId] FOREIGN KEY([firstTransferId]) REFERENCES [transfer].[transfer] ([transferId]),
    CONSTRAINT [fkTransferCardless_SecondTransferId] FOREIGN KEY([secondTransferId]) REFERENCES [transfer].[transfer] ([transferId])
)
