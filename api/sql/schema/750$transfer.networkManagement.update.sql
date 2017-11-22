ALTER PROCEDURE [transfer].[networkManagement.update]
    @issuerTxState smallint,
    @requestInformationCode char(3),
    @responseInformationCode char(3),
    @responseCode varchar(10), 
    @responseMessage varchar(250),
    @originalRequest VARCHAR(MAX) ,
    @originalResponse VARCHAR(MAX),
    @networkManagementId BIGINT
AS

UPDATE [transfer].[networkManagement]
   SET [issuerTxState] = @issuerTxState
      ,[requestInformationCode] =@requestInformationCode
      ,[responseInformationCode] = @responseInformationCode
      ,[responseCode] = @responseCode
      ,[responseMessage] = @responseMessage
      ,[originalRequest] = @originalRequest
      ,[originalResponse] = @originalResponse      
      ,[updatedOn] = SYSDATETIMEOFFSET()
 WHERE networkManagementId=@networkManagementId
