CREATE TABLE [transfer].[partner](
    actorId BIGINT NOT NULL,
    partnerId VARCHAR(50) NOT NULL,
    [name] NVARCHAR(50) NOT NULL,
    port VARCHAR(50) NOT NULL,
    mode VARCHAR(20) NOT NULL,
    settlementDate DATETIME,
    settlementAccount VARCHAR(50),
    feeAccount VARCHAR(50),
    commissionAccount VARCHAR(50),
    serialNumber BIGINT,
    settings XML,
    CONSTRAINT pkTransferPartner PRIMARY KEY CLUSTERED ([actorId] ASC),
    CONSTRAINT fkTransferPartner_Actor FOREIGN KEY(actorId) REFERENCES [core].[actor] (actorId),
    CONSTRAINT ukTransferPartnerPartnerId UNIQUE ([partnerId])
)
