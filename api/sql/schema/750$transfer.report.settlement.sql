ALTER PROCEDURE [transfer].[report.settlement]
    @settlementDate datetime = NULL,
    @meta core.metaDataTT READONLY
AS
-- checks if the user has a right to make the operation
DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
IF @return != 0
BEGIN
    RETURN 55555
END

SELECT 'settlement' as resultSetName
SELECT
    0,
    cardProductName [productName],
    n.itemName [transferType],
    SUM(CASE WHEN v.success = 1 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END) [transferAmount],
    SUM(CASE WHEN v.success = 1 THEN 1 END) [transferCount],
    SUM(CASE WHEN v.success = 1 THEN v.acquirerFee END) [transferFee],
    ISNULL(SUM(CASE WHEN v.success = 1 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END),0)+
    ISNULL(SUM(CASE WHEN v.success = 1 THEN v.acquirerFee END), 0) [dueTo],
    SUM(CASE WHEN v.success = 1 THEN 0 else 1 END) [deniedCount]
FROM
    [transfer].vTransfer v
JOIN
    card.vCard c ON c.cardId = v.cardId
JOIN
    core.itemName n ON n.itemNameId = v.transferTypeId
WHERE
    v.issuerTxState IN (2,3) AND
    v.settlementDate >= DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 0) AND
    v.settlementDate < DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 1) AND
    v.channelType = 'iso'
GROUP BY
    c.cardProductName,
    n.itemName
UNION ALL SELECT
    1,
    'Issuer',
    'Total',
    SUM(CASE WHEN v.success = 1 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END) [transferAmount],
    SUM(CASE WHEN v.success = 1 THEN 1 END) [transferCount],
    SUM(CASE WHEN v.success = 1 THEN v.acquirerFee END) [transferFee],
    ISNULL(SUM(CASE WHEN v.success = 1 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END),0)+
    ISNULL(SUM(CASE WHEN v.success = 1 THEN v.acquirerFee END), 0) [dueTo],
    SUM(CASE WHEN v.success = 1 THEN 0 else 1 END) [deniedCount]
FROM
    [transfer].vTransfer v
JOIN
    card.vCard c ON c.cardId = v.cardId
JOIN
    core.itemName n ON n.itemNameId = v.transferTypeId
WHERE
    v.issuerTxState IN (2,3) AND
    v.settlementDate >= DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 0) AND
    v.settlementDate < DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 1) AND
    v.channelType = 'iso'
UNION ALL SELECT
    2,
    cardProductName [Card],
    n.itemName [Tran_Desc],
    SUM(CASE WHEN v.success = 1 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END) [transferAmount],
    SUM(CASE WHEN v.success = 1 THEN 1 END) [transferCount],
    SUM(CASE WHEN v.success = 1 THEN v.acquirerFee END) [transferFee],
    ISNULL(SUM(CASE WHEN v.success = 1 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END),0)+
    ISNULL(SUM(CASE WHEN v.success = 1 THEN v.acquirerFee END), 0) [dueTo],
    SUM(CASE WHEN v.success = 1 THEN 0 else 1 END) [deniedCount]
FROM
    [transfer].vTransfer v
JOIN
    card.vCard c ON c.cardId = v.cardId
JOIN
    [core].[itemName] n ON n.itemNameId = v.transferTypeId
WHERE
    v.issuerTxState in (2,3) AND
    v.settlementDate >= DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 0) AND
    v.settlementDate < DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 1) AND
    c.issuerId != 'cbs'
GROUP BY
    cardProductName,
    n.itemName
UNION ALL SELECT
    3,
    'Acquirer',
    'Total',
    SUM(CASE WHEN v.success = 1 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END) [transferAmount],
    SUM(CASE WHEN v.success = 1 THEN 1 END) [transferCount],
    SUM(CASE WHEN v.success = 1 THEN v.acquirerFee END) [transferFee],
    ISNULL(SUM(CASE WHEN v.success = 1 AND n.itemCode IN ('sale', 'withdraw') THEN transferAmount END),0)+
    ISNULL(SUM(CASE WHEN v.success = 1 THEN v.acquirerFee END), 0) [dueTo],
    SUM(CASE WHEN v.success = 1 THEN 0 else 1 END) [deniedCount]
FROM
    [transfer].vTransfer v
JOIN
    card.vCard c ON c.cardId = v.cardId
JOIN
    core.itemName n ON n.itemNameId = v.transferTypeId
WHERE
    v.issuerTxState IN (2,3) AND
    v.settlementDate >= DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 0) AND
    v.settlementDate < DATEADD(DAY, DATEDIFF(DAY, 0, ISNULL(@settlementDate, GETDATE())), 1) AND
    c.issuerId != 'cbs'
ORDER BY
    1,2,3
