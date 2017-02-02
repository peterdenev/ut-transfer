ALTER PROCEDURE [transfer].[commissionSplit.post] -- post commission
    @splitIds core.arrayNumberList READONLY, -- the list of items
	@meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @callParams XML
DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
    
BEGIN TRY    
    DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta  
    
    IF @return != 0
    BEGIN
        RETURN 55555
    END
    
    DECLARE @transferTypeId BIGINT = 
    ( 
        SELECT i.itemNameId 
        FROM core.itemName i
        JOIN core.itemType t on t.itemTypeId = i.itemTypeId AND t.alias='operation' 
        WHERE i.itemCode = 'commission'
    )

    IF OBJECT_ID('tempdb..#transfer') IS NOT NULL
        DROP TABLE #transfer

    CREATE TABLE #transfer (
          transferId BIGINT,
          sourceAccount VARCHAR(50),
          destinationAccount VARCHAR(50),
          transferAmount MONEY
          )
      
    BEGIN TRANSACTION
    BEGIN
        DECLARE @tranferDT DATETIME = getdate()
        DECLARE @localDT VARCHAR(14)  = REPLACE(REPLACE(REPLACE(CONVERT(varchar, @tranferDT, 120),'-',''),':',''),' ','')
        DECLARE @settlementDate DATE = CONVERT(DATE, @tranferDT)
        DECLARE @today DATETIMEOFFSET = SYSDATETIMEOFFSET()

        

        -- 1 -->authorized
        
        INSERT INTO [transfer].[transfer] (sourceAccount, destinationAccount, transferCurrency, transferAmount, 
            channelId, channelType, transferTypeId, transferDateTime, localDateTime, settlementDate, reversed, issuerTxState, 
            destinationPort, [acquirerFee], [issuerFee], [transferFee], [description])
        OUTPUT inserted.transferId, inserted.sourceAccount, inserted.destinationAccount, inserted.transferAmount INTO #transfer
        SELECT s.credit, s.debit, 'GHS' /*transferCurrency*/,  sum(s.amount), 
            s.actorId, 'agent', @transferTypeId, @tranferDT, @localDT, @settlementDate, 0, 1,
            'cbs',  0.00, 0.00, 0.00, 'COMISSION'
        FROM [transfer].split s
        JOIN @splitIds si ON si.value = s.splitId
        GROUP BY s.credit, s.debit, s.actorId

        UPDATE s
        SET [state] = 2,
            txtId = t.transferId
        FROM [transfer].split s
        JOIN @splitIds si ON si.value = s.splitId
        JOIN #transfer t ON t.sourceAccount = s.credit AND t.destinationAccount = s.debit
       
        INSERT INTO [transfer].[splitAudit] (splitId, field, oldValue, createdBy, createdOn)
        SELECT s.splitId, 'state', s.[state], @userId, @today
        FROM [transfer].split s
        JOIN @splitIds si on si.value = s.splitId     
           
    END
    
    COMMIT TRANSACTION

    SELECT 'postCommission' AS resultSetName

    SELECT *
    FROM #transfer

    DROP TABLE #transfer

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
	EXEC [core].[error]
    RETURN 55555
END CATCH