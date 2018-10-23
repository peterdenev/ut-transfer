ALTER PROCEDURE [transfer].[transfer.updateInternalAccountsAndTransfers]
    @transfersId [core].[arrayNumberList] READONLY,
    @settlementDate DATE
AS
BEGIN TRY
    DECLARE @tranCounter INT = @@tranCount
    IF @tranCounter = 0
	DECLARE @splitId [core].[arrayNumberList]
	INSERT INTO @splitId
	SELECT s.splitId 
	FROM [transfer].[transfer] t
		  JOIN @transfersId ti on t.transferId=ti.value 
		  JOIN [transfer].[split] s ON s.transferId = t.transferId
		  JOIN (SELECT s.transferTypeId,s.splitDescription FROM [settlement].[transferTypeSplitTagMapping] s
				UNION
				SELECT i.itemNameId,'Fee' from core.itemName i where i.itemTypeId=1 AND itemCode like 'walletToVendor%'
				UNION
				SELECT i.itemNameId,'VAT' from core.itemName i where i.itemTypeId=1 AND itemCode like 'walletToVendor%'
				UNION
				SELECT i.itemNameId,'other tax' from core.itemName i where i.itemTypeId=1 AND itemCode like 'walletToVendor%'
				UNION
				SELECT i.itemNameId,'Vendor fee' from core.itemName i where i.itemTypeId=1 AND itemCode like 'walletToVendor%'
			     )ttsm ON ttsm.transferTypeId=t.transferTypeId AND s.description=ttsm.splitDescription


    BEGIN TRANSACTION
	   UPDATE  t SET settlementDate=@settlementDate 
	    FROM [transfer].[transfer] t		
		  JOIN(SELECT DISTINCT s.transferId 
			 FROM [transfer].[split] s 
			 JOIN @splitId st on st.value=s.splitId)s ON s.transferId = t.transferId

	   UPDATE b 
	   SET credit=b.credit+r.debit
	   FROM ledger.balance b 
	   JOIN ledger.account a on b.accountId=a.accountId
	   JOIN(
		  SELECT SUM(s.amount) debit
		  ,a.accountId
		  FROM [transfer].[transfer] t		
		  JOIN [transfer].[split] s ON s.transferId = t.transferId
		  JOIN @splitId st on st.value=s.splitId
		  JOIN ledger.account a ON a.accountNumber = s.debit AND isInternal = 1 AND isForSettlement = 1
		  GROUP BY a.accountId
	   )r ON a.accountId=r.accountId

	   UPDATE b 
	   SET debit=b.debit+r.credit
	   FROM ledger.balance b 
	   JOIN ledger.account a on b.accountId=a.accountId
	   JOIN(
		  SELECT SUM(s.amount) credit
		  ,a.accountId
		 FROM [transfer].[transfer] t		
		  JOIN [transfer].[split] s ON s.transferId = t.transferId
		  JOIN @splitId st on st.value=s.splitId
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
