ALTER PROCEDURE [transfer].[push.requestAcquirer]
    @transferId bigint
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    acquirerTxState = 1
WHERE
    transferId = @transferId AND
    acquirerTxState is NULL

IF @@ROWCOUNT <> 1 RAISERROR('transfer.requestacquirer', 16, 1);
