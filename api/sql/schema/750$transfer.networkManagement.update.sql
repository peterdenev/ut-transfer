ALTER PROCEDURE [transfer].[networkManagement.update]
    @issuerTxState smallint,
    @responseNetworkCode char(3),
    @responseCode varchar(10), 
    @responseMessage varchar(250),
    @originalResponse VARCHAR(MAX),
    @networkManagementId BIGINT,
    @networkData varchar(20)
AS

UPDATE [transfer].[networkManagement]
   SET [issuerTxState] = @issuerTxState
      ,[responseNetworkCode] = @responseNetworkCode
      ,[responseCode] = @responseCode
      ,[responseMessage] = @responseMessage
      ,[originalResponse] = @originalResponse
      ,[networkData] = @networkData 
      ,[updatedOn] = SYSDATETIMEOFFSET()
 WHERE networkManagementId=@networkManagementId
