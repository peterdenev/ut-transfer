ALTER PROCEDURE [transfer].[transfer.updateInternalAccountsAndTransfers]
    @transfersId [core].[arrayNumberList] READONLY,
    @settlementDate DATE
AS
BEGIN TRY
    DECLARE @tranCounter INT = @@tranCount
    IF @tranCounter = 0
	IF OBJECT_ID('tempdb..#split') IS NOT NULL
    DROP TABLE #split

CREATE TABLE #split (splitId BIGINT,amountSign smallint)
	 
	INSERT INTO #split
	SELECT s.splitId 
	FROM [transfer].[transfer] t
		  JOIN @transfersId ti on t.transferId=ti.value 
		  JOIN [transfer].[split] s ON s.transferId = t.transferId
		  JOIN (SELECT s.transferTypeId,s.splitDescription,s.amountSign FROM [settlement].[transferTypeSplitTagMapping] s
				UNION
				SELECT i.itemNameId,'Fee',-1 amountSign from core.itemName i where i.itemTypeId=1 AND itemCode like 'walletToVendor%'
				UNION
				SELECT i.itemNameId,'VAT',-1 amountSign from core.itemName i where i.itemTypeId=1 AND itemCode like 'walletToVendor%'
				UNION
				SELECT i.itemNameId,'other tax',-1 amountSign from core.itemName i where i.itemTypeId=1 AND itemCode like 'walletToVendor%'
				UNION
				SELECT i.itemNameId,'Vendor fee',-1 amountSign from core.itemName i where i.itemTypeId=1 AND itemCode like 'walletToVendor%'
			     )ttsm ON ttsm.transferTypeId=t.transferTypeId AND s.description=ttsm.splitDescription


    BEGIN TRANSACTION
	   UPDATE  t SET settlementDate=@settlementDate 
	    FROM [transfer].[transfer] t		
		  JOIN(SELECT DISTINCT s.transferId 
			 FROM [transfer].[split] s 
			 JOIN #split st on st.splitId=s.splitId)s ON s.transferId = t.transferId

	   UPDATE b 
	   SET debit=b.debit+r.debit
	   FROM ledger.balance b 
	   JOIN ledger.account a on b.accountId=a.accountId
	   JOIN(
		  SELECT SUM(s.amount*st.amountSign) debit
		  ,a.accountId
		  FROM [transfer].[transfer] t		
		  JOIN [transfer].[split] s ON s.transferId = t.transferId
		  JOIN #split st on st.splitId=s.splitId
		  JOIN ledger.account a ON a.accountNumber = s.debit AND isInternal = 1 AND isForSettlement = 1
		  GROUP BY a.accountId
	   )r ON a.accountId=r.accountId

	   UPDATE b 
	   SET debit=b.credit+r.credit
	   FROM ledger.balance b 
	   JOIN ledger.account a on b.accountId=a.accountId
	   JOIN(
		    SELECT SUM(s.amount*st.amountSign) debit
		  ,a.accountId
		  FROM [transfer].[transfer] t		
		  JOIN [transfer].[split] s ON s.transferId = t.transferId
		  JOIN #split st on st.splitId=s.splitId
		  JOIN ledger.account a ON a.accountNumber = s.credit AND isInternal = 1 AND isForSettlement = 1
		  GROUP BY a.accountId
	   )r ON a.accountId=r.accountId
    IF @tranCounter = 0
    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
    ROLLBACK TRANSACTION;
    EXEC [core].[error]
    RETURN 55555
END CATCH
