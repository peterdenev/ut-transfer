ALTER VIEW [transfer].vTransfer AS
SELECT
    *
    ,ISNULL(t.acquirerFee, 0)		 + 
     ISNULL(t.issuerFee, 0)		 + 
     ISNULL(t.transferFee, 0)			AS amountBilling				
    ,ISNULL(t.transferAmount, 0)	 + 
     ISNULL(t.acquirerFee, 0)		 + 
     ISNULL(t.issuerFee, 0)		 + 
     ISNULL(t.transferFee, 0)			AS amountSettlement			
FROM
    [transfer].[transfer] t
WHERE
    IsNull(reversed, 0) = 0
