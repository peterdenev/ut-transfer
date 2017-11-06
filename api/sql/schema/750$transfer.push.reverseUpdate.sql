ALTER PROCEDURE [transfer].[push.reverseUpdate]
    @reverseId bigint,
    @originalRequest TEXT = NULL,
    @issuerResponseCode varchar(10) = NULL, 
    @issuerResponseMessage varchar(250) = NULL
AS
SET NOCOUNT ON

IF @issuerResponseCode IS NOT NULL
BEGIN
    UPDATE
        [transfer].[reverse]
    SET
        issuerResponseCode = @issuerResponseCode,
        issuerResponseMessage = @issuerResponseMessage,
        issuerTxState = CASE WHEN @issuerResponseCode = '00'
            THEN 2
            ELSE 3
            END,
        updatedOn = GETDATE()
    WHERE
        reverseId = @reverseId
END
ELSE
BEGIN
    UPDATE
        [transfer].[reverse]
    SET
        originalRequest = @originalRequest,
        updatedOn = GETDATE()
    WHERE
        reverseId = @reverseId

END
