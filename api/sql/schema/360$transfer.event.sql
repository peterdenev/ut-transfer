CREATE TABLE [transfer].[event](
    eventId BIGINT IDENTITY(1000, 1) NOT NULL,
    eventDateTime DATETIME,
    transferId BIGINT NOT NULL,
    [state] VARCHAR(50) NOT NULL,
    [type] VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    [message] NVARCHAR(250),
    udfDetails XML,
    CONSTRAINT [pkTransferEvent] PRIMARY KEY CLUSTERED ([eventId] ASC),
    CONSTRAINT [fkTransferEvent_TransferId] FOREIGN KEY([transferId]) REFERENCES [transfer].[transfer] ([transferId])
)
