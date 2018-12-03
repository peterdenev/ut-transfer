ALTER PROCEDURE [transfer].[push.markForReversal]
    @transferId bigint
AS
SET NOCOUNT ON

IF NOT EXISTS (SELECT 1 FROM [transfer].[transfer] WHERE transferId = @transferId)
BEGIN
    RAISERROR('transfer.not.found', 16, 1);
END

DECLARE @cbsReversalAttempts bigint = ( SELECT cbsReversalAttempts FROM [transfer].[transfer] WHERE transferId = @transferId )

UPDATE
    [transfer].[transfer]
SET
    markedForReversal = 1,
	cbsReversalAttempts = (COALESCE(@cbsReversalAttempts, 0) + 1)
WHERE
    transferId = @transferId

