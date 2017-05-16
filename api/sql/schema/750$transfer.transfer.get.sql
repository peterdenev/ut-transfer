ALTER PROCEDURE [transfer].[transfer.get]
    @transferIdAcquirer NVARCHAR (50) = NULL, -- the front end transfer id
    @transferId BIGINT = NULL, -- the transfer id
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS

     -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return INT = 0
--    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = NULL, @meta = @meta

    IF (isnull(@transferID, 0) = 0 AND isnull(@transferIdAcquirer, '') = '')
      BEGIN
            RAISERROR('transfer.missingParameter', 16, 1);
            RETURN 55555 
      END
   
   SELECT 'transfer' AS resultSetName
   
   SELECT transferId, transferTypeId, acquirerCode, transferIdAcquirer, transferIdLedger, transferIdIssuer, transferIdMerchant, 
   transferDateTime, localDateTime, t.settlementDate, channelId, channelType, ordererId, merchantId, merchantInvoice, 
   merchantPort, merchantType, cardId, sourceAccount, destinationAccount, expireTime, expireCount, reversed, retryTime, 
   retryCount, ledgerTxState, issuerTxState, acquirerTxState, merchantTxState, issuerId, ledgerId, transferCurrency, transferAmount, 
   acquirerFee, issuerFee, transferFee, [description], pi.port issuerPort, pl.port ledgerPort
   FROM  [transfer].[transfer] t
   JOIN  [transfer].[partner] pi on pi.partnerId = t.issuerId
   LEFT JOIN [transfer].[partner] pl on pl.partnerId = t.ledgerId
   WHERE (@transferIdAcquirer IS NULL OR [transferIdAcquirer] = @transferIdAcquirer)
        AND (@transferId IS NULL OR [transferId] = @transferId)

   SELECT 'transferSplit' AS resultSetName

   SELECT splitId, ts.transferId, conditionId, splitNameId, debit, credit, amount, ts.[description], tag, debitActorId, creditActorId, debitItemId, creditItemId, [state], [transferIdPayment]
   FROM [transfer].[split] ts 
   JOIN [transfer].[transfer] tt ON ts.transferId = tt.transferId
   WHERE (@transferIdAcquirer IS NULL OR [transferIdAcquirer] = @transferIdAcquirer)
        AND (@transferId IS NULL OR tt.[transferId] = @transferId)