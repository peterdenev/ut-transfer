ALTER PROCEDURE [transfer].[networkManagement.add]
   @issuerTxState smallint,
    @requestInformationCode char(3),
    @responseInformationCode char(3),
    @responseCode varchar(10), 
    @responseMessage varchar(250),
    @originalRequest VARCHAR(MAX) ,
    @originalResponse VARCHAR(MAX)
AS
DECLARE  @networkManagementId BIGINT
INSERT INTO [transfer].[networkManagement]
           ([issuerTxState]
           ,[requestInformationCode]
           ,[responseInformationCode]
           ,[responseCode]
           ,[responseMessage]
           ,[originalRequest]
           ,[originalResponse]     
           ,[createdOn])
VALUES (
    @issuerTxState ,
    @requestInformationCode ,
    @responseInformationCode ,
    @responseCode , 
    @responseMessage ,
    @originalRequest  ,
    @originalResponse ,
    SYSDATETIMEOFFSET()
)
SET @networkManagementId=SCOPE_IDENTITY()

SELECT @networkManagementId networkManagementId 

