ALTER PROCEDURE [transfer].[push.reverseUpdate]
    @reverseId bigint,
    @originalRequest VARCHAR(MAX) = NULL,
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
