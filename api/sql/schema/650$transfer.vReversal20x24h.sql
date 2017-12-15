ALTER VIEW [transfer].vReversal20x24h AS
SELECT
    *
FROM
    [transfer].[vReversal]
WHERE
    20 > ISNULL(expireCount, 0) AND
    transferDateTime > DATEADD(DAY, -1, GETDATE()) AND
    channelType IN ('ATM', 'web')
