ALTER PROCEDURE [transfer].[transfer.create]
    @transfer transfer.transferTT READONLY,
    @split transfer.splitTT READONLY,
    @meta core.metaDataTT READONLY
AS
DECLARE @callParams XML
DECLARE @userId BIGINT
DECLARE @transferId BIGINT

BEGIN TRY

    -- checks if the user has a right to make the operation
    DECLARE @actionID varchar(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @return INT = 0
    EXEC @return = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    SET @userId = (SELECT [auth.actorId] FROM @meta)

    BEGIN TRANSACTION

        INSERT INTO [transfer].[transfer] ([transferTypeId], [acquirerCode], [transferIdAcquirer], [transferIdLedger], [transferIdIssuer],
            [transferIdMerchant], [transferDateTime], [localDateTime], [settlementDate], [channelId], [channelType], [ordererId], [merchantId],
            [merchantInvoice], [merchantPort], [merchantType], [cardId], [sourceAccount], [destinationAccount], [expireTime], [expireCount], [reversed],
            [retryTime], [retryCount], [ledgerTxState], [issuerTxState], [acquirerTxState], [merchantTxState], [issuerId], [ledgerId], [transferCurrency],
            [transferAmount], [acquirerFee], [issuerFee], [transferFee], [taxVAT], [taxWTH], [taxOther], [commission], [description], [comment], [noteToSelf],
            [utilityRef], [transferIdT24], [sourceAccountWorkingBalance], [sourceAccountOnlineBalance], [sourceAccountLockedBalance], [sourceAccountNewBalance],
            [sourceAccountAccountCategory], [sourceAccountRiskProfile], [destinationAccountWorkingBalance], [destinationAccountOnlineBalance],
            [destinationAccountLockedBalance], [destinationAccountNewBalance], [destinationAccountAccountCategory], [destinationAccountRiskProfile],
            [transferStatusSuccess])
        SELECT [transferTypeId], [acquirerCode], [transferIdAcquirer], [transferIdLedger], [transferIdIssuer],
            [transferIdMerchant], [transferDateTime], [localDateTime], [settlementDate], [channelId], [channelType], [ordererId], [merchantId],
            [merchantInvoice], [merchantPort], [merchantType], [cardId], [sourceAccount], [destinationAccount], [expireTime], [expireCount], [reversed],
            [retryTime], [retryCount], [ledgerTxState], [issuerTxState], [acquirerTxState], [merchantTxState], [issuerId], [ledgerId], [transferCurrency],
            [transferAmount], [acquirerFee], [issuerFee], [transferFee], [taxVAT], [taxWTH], [taxOther], [commission], [description], [comment], [noteToSelf],
            [utilityRef], [transferIdT24], [sourceAccountWorkingBalance], [sourceAccountOnlineBalance], [sourceAccountLockedBalance], [sourceAccountNewBalance],
            [sourceAccountAccountCategory], [sourceAccountRiskProfile], [destinationAccountWorkingBalance], [destinationAccountOnlineBalance],
            [destinationAccountLockedBalance], [destinationAccountNewBalance], [destinationAccountAccountCategory], [destinationAccountRiskProfile],
            [transferStatusSuccess]
        FROM @transfer

        SET @transferId = SCOPE_IDENTITY ()

        INSERT INTO [transfer].[split](transferId, debit, credit, amount, conditionId, splitNameId, [description], tag, creditActorId,
            debitActorId, creditItemId, debitItemId, [state], [transferIdPayment])
        SELECT @transferId, debit, credit, amount, conditionId, splitNameId, [description], tag, creditActorId,
            debitActorId, creditItemId, debitItemId, [state], [transferIdPayment]
        FROM @split

    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    IF error_number() NOT IN (2627)
        BEGIN
            EXEC [core].[error]
        END
    ELSE
    BEGIN TRY
        RAISERROR('transfer.idAlreadyExists', 16, 1);
    END TRY
    BEGIN CATCH
        EXEC [core].[error]
    END CATCH
END CATCH
