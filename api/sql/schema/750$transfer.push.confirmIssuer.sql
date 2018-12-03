ALTER PROCEDURE [transfer].[push.confirmIssuer]
    @transferId bigint,
    @transferIdIssuer varchar(50),
    @transferIdAcquirer varchar(50),
    @cbsPostingDate DATETIME = NULL
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    transferIdIssuer = @transferIdIssuer,
    transferIdAcquirer = @transferIdAcquirer,
    cbsPostingDate = @cbsPostingDate,
    issuerTxState = 2
WHERE
    transferId = @transferId AND
    issuerTxState = 1

IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmIssuer', 16, 1);
