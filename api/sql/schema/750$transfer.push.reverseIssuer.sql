ALTER PROCEDURE [transfer].[push.reverseIssuer]
    @transferId bigint
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    issuerTxState = 3
WHERE
    transferId = @transferId AND
    issuerTxState = 1

IF @@ROWCOUNT <> 1 RAISERROR('transfer.reverseIssuer', 16, 1);
