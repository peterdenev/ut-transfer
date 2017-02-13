CREATE TABLE [transfer].[event](
    eventId bigint IDENTITY(1000,1) NOT NULL,
    eventDateTime datetime,
    transferId bigint NOT NULL,
    [state] varchar(50) NOT NULL,
    [type] varchar(50) NOT NULL,
    source varchar(50) NOT NULL,
    [message] nvarchar(250),
    udfDetails XML,
    CONSTRAINT [pkTransferEvent] PRIMARY KEY CLUSTERED ([eventId] ASC),
    CONSTRAINT [fkTransferEvent_TransferId] FOREIGN KEY([transferId]) REFERENCES [transfer].[transfer] ([transferId])
)
