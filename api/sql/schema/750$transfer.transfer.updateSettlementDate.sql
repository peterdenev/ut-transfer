ALTER PROCEDURE [transfer].[transfer.updateSettlementDate]
    @transfersId [core].[arrayNumberList] READONLY,
    @settlementDate DATE
AS
BEGIN TRY
    DECLARE @tranCounter INT = @@tranCount
    IF @tranCounter = 0
    BEGIN TRANSACTION
	   UPDATE  t SET settlementDate=@settlementDate 
	   FROM[transfer].[transfer] t
	   JOIN @transfersId ti on t.transferId=ti.value 

	   UPDATE b 
	   SET debit=b.debit+r.debit
	   FROM ledger.balance b 
	   JOIN ledger.account a on b.accountId=a.accountId
	   JOIN(
		  SELECT SUM(s.amount) debit
		  ,a.accountId
		  FROM [transfer].[transfer] t
		  JOIN @transfersId ti on t.transferId=ti.value 
		  JOIN [transfer].[split] s ON s.transferId = t.transferId
		  JOIN ledger.account a ON a.accountNumber = s.debit AND isInternal = 1 AND isForSettlement = 1
		  GROUP BY a.accountId
	   )r ON a.accountId=r.accountId

	   UPDATE b 
	   SET debit=b.credit+r.credit
	   FROM ledger.balance b 
	   JOIN ledger.account a on b.accountId=a.accountId
	   JOIN(
		  SELECT SUM(s.amount) credit
		  ,a.accountId
		  FROM [transfer].[transfer] t
		  JOIN @transfersId ti on t.transferId=ti.value 
		  JOIN [transfer].[split] s ON s.transferId = t.transferId
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
