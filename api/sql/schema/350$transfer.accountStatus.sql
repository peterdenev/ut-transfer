CREATE TABLE [transfer].[accountStatus](
    accountStatusId bigint IDENTITY(1,1) NOT NULL,
    merchantId varchar(50),
    statusAmount money NOT NULL,
    issuerTxState smallint,
    issuerId varchar(50),
    transferDateTime datetime2(0) NOT NULL,
    localDateTime varchar(14),
    transferIdIssuer varchar(50),
    issuerResponseCode varchar(10), 
    issuerResponseMessage varchar(250),
    originalRequest VARCHAR(MAX) NULL,
    originalResponse VARCHAR(MAX) NULL,
    stan char(6) NULL,
    createdBy BIGINT NULL,
    createdOn DATETIMEOFFSET (7), 
    updatedBy BIGINT NULL,
    updatedOn DATETIMEOFFSET (7)
)