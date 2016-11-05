ALTER PROCEDURE [transfer].[push.confirmIssuer]
    @transferId bigint,
    @transferIdIssuer varchar(50)
AS
DECLARE @callParams XML

BEGIN TRY

    UPDATE
        [transfer].[transfer]
    SET
        transferIdIssuer = @transferIdIssuer,
        issuerTxState = 2
    WHERE
        transferId = @transferId AND
        issuerTxState = 1

    IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmIssuer', 16, 1);

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    EXEC core.error
    RETURN 55555
END CATCH
