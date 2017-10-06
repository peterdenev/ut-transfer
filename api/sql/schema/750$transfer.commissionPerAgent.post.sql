ALTER PROCEDURE [transfer].[commissionPerAgent.post] -- post commission
    @actorId BIGINT,-- actorId of the agent
    @dateFrom DATETIME = NULL, --start date 
    @dateTo DATETIME, --end date
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

    DECLARE @tranferDT DATETIME = getdate()
    DECLARE @localDT VARCHAR(14)  = REPLACE(REPLACE(REPLACE(CONVERT(varchar, @tranferDT, 120),'-',''),':',''),' ','')
    DECLARE @settlementDate DATE = CONVERT(DATE, @tranferDT)

    DECLARE @today DATETIMEOFFSET = SYSDATETIMEOFFSET()

    SET  @dateTo = DATEADD(day, 1, @dateTo)

    IF OBJECT_ID('tempdb..#splitPost') IS NOT NULL
        DROP TABLE #splitPost

    CREATE TABLE #splitPost
    ( splitId BIGINT )

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
       
        INSERT INTO #splitPost (splitId)
        SELECT s.splitId
        FROM 
            [transfer].split s
        JOIN 
            [transfer].[transfer] t ON t.transferId = s.transferId
        WHERE s.actorId = @actorId AND t.issuerTxState = 2 AND t.reversed = 0 AND t.channelType ='agent'
        AND s.[state] = 4 AND s.tag LIKE '%|commission|%' AND s.tag LIKE '%|pending|%'
        AND ( @dateFrom IS NULL OR t.transferDateTime >= @dateFrom )
        AND t.transferDateTime < @dateTo
         
        -- 1 -->authorized

        INSERT INTO [transfer].[transfer] (sourceAccount, destinationAccount, transferCurrency, transferAmount,
            channelId, channelType, transferTypeId, transferDateTime, localDateTime, settlementDate, reversed, issuerTxState,
            destinationPort, [acquirerFee], [issuerFee], [transferFee], [description])
        OUTPUT inserted.transferId, inserted.sourceAccount, inserted.destinationAccount, inserted.transferAmount INTO #transfer
        SELECT s.debit, s.credit, 'GHS' /*transferCurrency*/,  CONVERT( DECIMAL(17,2), sum(s.amount) ),
            s.actorId, 'agent', @transferTypeId, @tranferDT, @localDT, @settlementDate, 0, NULL,
            'cbs',  0.00, 0.00, 0.00, 'COMISSION'
        FROM [transfer].split s
        JOIN #splitPost si ON si.splitId = s.splitId
        GROUP BY s.credit, s.debit, s.actorId

        INSERT INTO [transfer].[splitAudit] (splitId, field, oldValue, createdBy, createdOn)
        SELECT s.splitId, 'status', s.[state], @userId, @today
        FROM [transfer].split s
        JOIN #splitPost si on si.splitId = s.splitId

        UPDATE s
        SET [state] = 2,
            txtId = t.transferId
        FROM [transfer].split s
        JOIN #splitPost si on si.splitId = s.splitId
        JOIN #transfer t ON t.sourceAccount = s.debit AND t.destinationAccount = s.credit

    END

    COMMIT TRANSACTION

    SELECT 'postCommission' AS resultSetName

    SELECT *
    FROM #transfer

    DROP TABLE #transfer
    DROP TABLE #splitPost

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
	EXEC [core].[error]
    RETURN 55555
END CATCH