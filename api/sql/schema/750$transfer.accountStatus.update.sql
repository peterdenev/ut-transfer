ALTER PROCEDURE [transfer].[accountStatus.update]
    @accountStatusId BIGINT,
    @transferIdIssuer varchar(20),
    @issuerResponseCode varchar(10), 
    @issuerResponseMessage varchar(250),
    @originalResponse VARCHAR(MAX) = NULL,
    @stan char(6) = NULL
AS

UPDATE [transfer].[accountStatus]
SET issuerTxState = 2
    , transferIdIssuer = @transferIdIssuer
    , issuerResponseCode = @issuerResponseCode
    , issuerResponseMessage = @issuerResponseMessage
    , originalResponse = @originalResponse
    , stan = @stan
    , updatedOn = SYSDATETIMEOFFSET()
WHERE accountStatusId = @accountStatusId
