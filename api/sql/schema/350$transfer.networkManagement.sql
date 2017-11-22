CREATE TABLE [transfer].[networkManagement](
    networkManagementId bigint IDENTITY(1,1) NOT NULL,
    issuerTxState smallint,
    requestInformationCode char(3),
    responseInformationCode char(3),
    responseCode varchar(10), 
    responseMessage varchar(250),
    originalRequest VARCHAR(MAX) ,
    originalResponse VARCHAR(MAX) ,
    createdBy BIGINT  NULL,
    createdOn DATETIMEOFFSET (7)  NULL, 
    updatedBy BIGINT ,
    updatedOn DATETIMEOFFSET (7),
    CONSTRAINT [pkТransferNetworkManagement] PRIMARY KEY CLUSTERED (networkManagementId ASC)

)