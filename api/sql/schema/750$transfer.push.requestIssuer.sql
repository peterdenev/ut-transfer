ALTER PROCEDURE [transfer].[push.requestIssuer]
    @transferId bigint
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    issuerTxState = 1
WHERE
    transferId = @transferId AND
    issuerTxState is NULL

IF @@ROWCOUNT <> 1 RAISERROR('transfer.requestIssuer', 16, 1);
