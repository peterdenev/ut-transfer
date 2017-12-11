CREATE TABLE [transfer].[networkManagement](
    networkManagementId bigint IDENTITY(1,1) NOT NULL,
    mti char(4),
    issuerTxState smallint,
    acquirerTxState smallint,
    requestSourceId char(6),
    requestNetworkCode char(3),
    responseNetworkCode char(3),
    responseCode varchar(10), 
    responseMessage varchar(250),
    originalRequest VARCHAR(MAX),
    originalResponse VARCHAR(MAX),
    networkData varchar(20) NULL,
    createdBy BIGINT  NULL,
    createdOn DATETIMEOFFSET (7)  NULL, 
    updatedBy BIGINT,
    updatedOn DATETIMEOFFSET (7),
    CONSTRAINT [pkТransferNetworkManagement] PRIMARY KEY CLUSTERED (networkManagementId ASC)

)