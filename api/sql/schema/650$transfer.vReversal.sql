ALTER VIEW [transfer].vReversal AS
SELECT
    t.*, p.port
FROM
    [transfer].[transfer] t
JOIN
    [transfer].[partner] p ON (((
        (t.issuerTxState = 2 AND ISNULL(t.acquirerTxState, 0) IN (0, 3, 4, 5) AND p.mode = 'online' AND t.channelType IN ('ATM')) OR --tx succeeded at issuer during online but failed at acquirer and current mode is online
        (t.issuerTxState = 8 AND ISNULL(t.acquirerTxState, 0) IN (0, 3, 4, 5) AND p.mode IN ('online', 'offline')) OR --tx succeeded at issuer during offline but failed at acquirer and current mode is online/offline
        (ISNULL(t.merchantTxState, 0) IN (1, 3)) OR                                                               --tx failed at merchant (succeeded at issuer implicitly)
        (t.issuerTxState IN (1,4) AND p.mode = 'online') OR                                                    --tx timed out at issuer during online and current mode is online
        (t.issuerTxState IN (7,9) AND p.mode IN ('online', 'offline'))                                        --tx timed out during offline and current mode is online/offline
    ) AND p.partnerId = t.issuerId) OR ((
        (t.ledgerTxState = 2 AND t.issuerTxState = 3) OR
        (t.ledgerTxState IN (1,4) AND p.mode = 'online') OR                                                    --tx timed out at issuer during online and current mode is online
        (t.ledgerTxState IN (7,9) AND p.mode IN ('online', 'offline'))                                        --tx timed out during offline and current mode is online/offline
    ) AND  p.partnerId = t.ledgerId))
WHERE
    t.reversed = 0 OR
    t.reversedLedger = 0
