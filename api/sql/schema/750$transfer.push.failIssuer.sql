ALTER PROCEDURE [transfer].[push.failIssuer]
    @transferId bigint
AS
DECLARE @callParams XML

BEGIN TRY

    UPDATE
        [transfer].[transfer]
    SET
        issuerTxState = 4
    WHERE
        transferId = @transferId AND
        issuerTxState = 1

    IF @@ROWCOUNT <> 1 RAISERROR('transfer.failIssuer', 16, 1);

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    EXEC core.error
    RETURN 55555
END CATCH
