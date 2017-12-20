ALTER PROCEDURE [transfer].[networkManagement.add]
    @requestNetworkCode char(3),
    @originalRequest VARCHAR(MAX),
    @originalResponse VARCHAR(MAX),
    @mti char(4),
    @requestSourceId char(6),
	@responseCode varchar(10),
    @issuerChannelId char(4)
AS
DECLARE  @networkManagementId BIGINT
INSERT INTO [transfer].[networkManagement]
           ([issuerTxState]
           ,[requestNetworkCode]
           ,[originalRequest]
           ,[originalResponse]
		   ,[mti]
           ,[issuerChannelId]
		   ,[requestSourceId]
		   ,[responseCode]  
           ,[createdOn])
VALUES (
    1 ,
    @requestNetworkCode ,
    @originalRequest,
    @originalResponse,
	@mti,
    @issuerChannelId,
	@requestSourceId,
	@responseCode,
    SYSDATETIMEOFFSET()
)
SET @networkManagementId=SCOPE_IDENTITY()

SELECT @networkManagementId networkManagementId 

