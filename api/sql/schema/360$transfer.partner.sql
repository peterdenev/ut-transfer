CREATE TABLE [transfer].[partner](
    actorId bigint NOT NULL,
    partnerId varchar(50) NOT NULL,
    [name] nvarchar(50) NOT NULL,
    port varchar(50) NOT NULL,
    mode varchar(20) NOT NULL,
    settlementDate datetime,
    settlementAccount varchar(50),
    feeAccount varchar(50),
    commissionAccount varchar(50),
    serialNumber bigint,
    settings XML,
    CONSTRAINT pkTransferPartner PRIMARY KEY CLUSTERED ([actorId] ASC),
    CONSTRAINT fkTransferPartner_Actor FOREIGN KEY(actorId) REFERENCES [core].[actor] (actorId),
    CONSTRAINT ukTransferPartnerPartnerId UNIQUE ([partnerId])
)
