ALTER VIEW [transfer].vTransfer AS
SELECT * ,
    ISNULL(t.acquirerFee, 0) + ISNULL(t.issuerFee, 0) + ISNULL(t.transferFee, 0) AS amountBilling,
    ISNULL(t.transferAmount, 0) + ISNULL(t.acquirerFee, 0) + ISNULL(t.issuerFee, 0) + ISNULL(t.transferFee, 0)	AS amountSettlement,
    transferStatusSuccess success
FROM
    [transfer].[transfer] t
WHERE
    ISNULL(reversed, 0) = 0
