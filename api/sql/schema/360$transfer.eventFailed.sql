CREATE TABLE [transfer].[eventFailed](
    eventFailedId bigint IDENTITY(1000,1) NOT NULL,
    eventDateTime datetime,
    transferId bigint NOT NULL,
    issuerChannelId char(4) NULL,
    [state] varchar(50) NOT NULL,
    [type] varchar(50) NOT NULL,
    source varchar(50) NOT NULL,
    responseCode varchar(10),
    responseMessage varchar(250),
    [message] varchar(250),
    udfDetails XML,
    CONSTRAINT [pkTransferEventFailed] PRIMARY KEY CLUSTERED ([eventFailedId] ASC),
    CONSTRAINT [fkTransferEventFailed_TransferId] FOREIGN KEY([transferId]) REFERENCES [transfer].[transfer] ([transferId])
)
