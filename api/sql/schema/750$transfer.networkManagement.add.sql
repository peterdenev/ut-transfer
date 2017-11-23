ALTER PROCEDURE [transfer].[networkManagement.add]
    @requestNetworkCode char(3),
    @originalRequest VARCHAR(MAX) 
AS
DECLARE  @networkManagementId BIGINT
INSERT INTO [transfer].[networkManagement]
           ([issuerTxState]
           ,[requestNetworkCode]
           ,[originalRequest]   
           ,[createdOn])
VALUES (
    1 ,
    @requestNetworkCode ,
    @originalRequest  ,
    SYSDATETIMEOFFSET()
)
SET @networkManagementId=SCOPE_IDENTITY()

SELECT @networkManagementId networkManagementId 

