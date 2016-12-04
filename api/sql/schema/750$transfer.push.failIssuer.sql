ALTER PROCEDURE [transfer].[push.failIssuer]
    @transferId bigint
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    issuerTxState = 4
WHERE
    transferId = @transferId AND
    issuerTxState = 1

IF @@ROWCOUNT <> 1 RAISERROR('transfer.failIssuer', 16, 1);
