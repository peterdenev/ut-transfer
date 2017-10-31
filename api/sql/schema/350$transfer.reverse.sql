CREATE TABLE [transfer].[reverse](
    transferId bigint IDENTITY(1000,1) NOT NULL,
    originalTransferId bigint NOT NULL,
    transferAmount money NOT NULL,
    transferDateTime datetime NOT NULL,
    localDateTime varchar(14),
    networkData varchar(20) NULL,
    originalRequest varchar(2000) NULL,
    mcResponse varchar(2000) NULL,
    CONSTRAINT [pkTransferReverse] PRIMARY KEY CLUSTERED ([transferId] ASC),
    CONSTRAINT [fkTransferReverse_Transfer] FOREIGN KEY([originalTransferId]) REFERENCES [transfer].[transfer] ([transferId])
)