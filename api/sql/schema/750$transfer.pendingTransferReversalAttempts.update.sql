ALTER PROCEDURE [transfer].[pendingTransferReversalAttempts.update] -- update status of pending transfer
    @pendingId INT, -- unique id of pending transaction
    @reversalAttempts INT --counter of reversal attempts
AS
SET NOCOUNT ON
DECLARE @callParams XML

BEGIN TRY
   
    UPDATE
        [transfer].[pending]
    SET
        reversalAttempts = @reversalAttempts
    WHERE
        pendingId = @pendingId

    IF @@ROWCOUNT = 1 
    BEGIN
        SELECT 'transferPending' AS resultSetName
        SELECT 'Successfuly'

    END
    ELSE
    BEGIN
        SELECT 'transferPending' AS resultSetName
        SELECT 'Failed'
    END

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK
	EXEC [core].[error]
    RETURN 55555
END CATCH