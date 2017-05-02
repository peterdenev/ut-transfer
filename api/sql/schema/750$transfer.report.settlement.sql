ALTER PROCEDURE [transfer].[report.settlement]
    @settlementDate datetime = NULL
AS
SELECT
    0,
    p.name [Card],
    n.itemName [Tran_Desc],
    SUM(CASE WHEN v.issuerTxState = 2 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END) [Transaction_Amount],
    SUM(CASE WHEN v.issuerTxState = 2 THEN 1 END) [Approved_Count],
    SUM(CASE WHEN v.issuerTxState = 2 THEN v.acquirerFee END) [Fee],
    ISNULL(SUM(CASE WHEN v.issuerTxState = 2 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END),0)+
    ISNULL(SUM(CASE WHEN v.issuerTxState = 2 THEN v.acquirerFee END), 0) [Due],
    SUM(CASE WHEN v.issuerTxState = 2 THEN 0 else 1 END) [Denied_Count]
FROM
    [transfer].vTransfer v
JOIN
    card.card c ON c.cardId = v.cardId
JOIN
    card.product p ON c.productId = p.productId
JOIN
    core.itemName n ON n.itemNameId = v.transferTypeId
WHERE
    v.issuerTxState IN (2,3) AND
    v.settlementDate >= DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 0) AND
    v.settlementDate < DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 1) AND
    v.channelType = 'iso'
GROUP BY
    p.name,
    n.itemName
UNION ALL SELECT
    1,
    'Issuer',
    'Total',
    SUM(CASE WHEN v.issuerTxState = 2 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END) [Transaction_Amount],
    SUM(CASE WHEN v.issuerTxState = 2 THEN 1 END) [Approved_Count],
    SUM(CASE WHEN v.issuerTxState = 2 THEN v.acquirerFee END) [Fee],
    ISNULL(SUM(CASE WHEN v.issuerTxState = 2 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END),0)+
    ISNULL(SUM(CASE WHEN v.issuerTxState = 2 THEN v.acquirerFee END), 0) [Due],
    SUM(CASE WHEN v.issuerTxState = 2 THEN 0 else 1 END) [Denied_Count]
FROM
    [transfer].vTransfer v
JOIN
    card.card c ON c.cardId = v.cardId
JOIN
    card.product p ON c.productId = p.productId
JOIN
    core.itemName n ON n.itemNameId = v.transferTypeId
WHERE
    v.issuerTxState IN (2,3) AND
    v.settlementDate >= DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 0) AND
    v.settlementDate < DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 1) AND
    v.channelType = 'iso'
UNION ALL SELECT
    2,
    p.name [Card],
    n.itemName [Tran_Desc],
    SUM(CASE WHEN v.issuerTxState = 2 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END) [Transaction_Amount],
    SUM(CASE WHEN v.issuerTxState = 2 THEN 1 END) [Approved_Count],
    SUM(CASE WHEN v.issuerTxState = 2 THEN v.acquirerFee END) [Fee],
    ISNULL(SUM(CASE WHEN v.issuerTxState = 2 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END),0)+
    ISNULL(SUM(CASE WHEN v.issuerTxState = 2 THEN v.acquirerFee END), 0) [Due],
    SUM(CASE WHEN v.issuerTxState = 2 THEN 0 else 1 END) [Denied_Count]
FROM
    [transfer].vTransfer v
JOIN
    card.card c ON c.cardId = v.cardId
JOIN
    card.product p ON c.productId = p.productId
JOIN
    core.itemName n ON n.itemNameId = v.transferTypeId
WHERE
    v.issuerTxState in (2,3) AND
    v.settlementDate >= DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 0) AND
    v.settlementDate < DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 1) AND
    p.issuerId != 'cbs'
GROUP BY
    p.name,
    n.itemName
UNION ALL SELECT
    3,
    'Acquirer',
    'Total',
    SUM(CASE WHEN v.issuerTxState = 2 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END) [Transaction_Amount],
    SUM(CASE WHEN v.issuerTxState = 2 THEN 1 END) [Approved_Count],
    SUM(CASE WHEN v.issuerTxState = 2 THEN v.acquirerFee END) [Fee],
    ISNULL(SUM(CASE WHEN v.issuerTxState = 2 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END),0)+
    ISNULL(SUM(CASE WHEN v.issuerTxState = 2 THEN v.acquirerFee END), 0) [Due],
    SUM(CASE WHEN v.issuerTxState = 2 THEN 0 else 1 END) [Denied_Count]
FROM
    [transfer].vTransfer v
JOIN
    card.card c ON c.cardId = v.cardId
JOIN
    card.product p ON c.productId = p.productId
JOIN
    core.itemName n ON n.itemNameId = v.transferTypeId
WHERE
    v.issuerTxState IN (2,3) AND
    v.settlementDate >= DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 0) AND
    v.settlementDate < DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 1) AND
    p.issuerId != 'cbs'
ORDER BY
    1,2,3
