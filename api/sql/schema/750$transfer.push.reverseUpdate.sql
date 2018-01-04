ALTER PROCEDURE [transfer].[push.reverseUpdate]
    @reverseId bigint,
    @originalRequest VARCHAR(MAX) = NULL,
    @originalResponse VARCHAR(MAX) = NULL,
    @issuerResponseCode varchar(10) = NULL, 
    @issuerResponseMessage varchar(250) = NULL,
    @issuerTxState int = NULL
AS
SET NOCOUNT ON

IF @issuerResponseCode IS NOT NULL
BEGIN
    UPDATE
        [transfer].[reverse]
    SET
        issuerResponseCode = @issuerResponseCode,
        issuerResponseMessage = @issuerResponseMessage,
        issuerTxState = @issuerTxState,
        originalResponse = @originalResponse,
        updatedOn = SYSDATETIMEOFFSET()
    WHERE
        reverseId = @reverseId
END
ELSE
BEGIN
    UPDATE
        [transfer].[reverse]
    SET
        originalRequest = @originalRequest,
        updatedOn = SYSDATETIMEOFFSET()
    WHERE
        reverseId = @reverseId

END
