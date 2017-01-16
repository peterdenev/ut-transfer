CREATE TABLE [transfer].[partner](
    partnerId varchar(50) NOT NULL,
    [name] nvarchar(50) NOT NULL,
    port varchar(50) NOT NULL,
    mode varchar(20) NOT NULL,
    settlementDate datetime,
    serialNumber bigint,
    settings XML,
    CONSTRAINT [pkTransferPartner] PRIMARY KEY CLUSTERED ([partnerId] ASC)
)
