ALTER PROCEDURE [transfer].[transferReceipt.get]
    @transferId BIGINT, -- the transfer id
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    DECLARE @callParams XML

BEGIN TRY
    -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
    EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @RETURN != 0
    BEGIN
        RETURN 55555
    END

    SELECT 'transferReceipt' AS resultSetName
    SELECT
        transferId,
        transferAmount,
        sourceAccount,
        destinationAccount,
        transferIdIssuer,
        transferDateTime,
        channelType,
        channelId,
        description,
        issuerTxState,
        transferCurrency,
        sourceAccountHolder,
        destinationAccountHolder,
        destinationBankName,
        SWIFT
    FROM [transfer].[transfer]
    WHERE transferId = @transferId

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    EXEC [core].[error]
    RETURN 55555
END CATCH
