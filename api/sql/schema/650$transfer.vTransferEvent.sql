ALTER VIEW [transfer].[vTransferEvent]
AS
SELECT
    t.[transferId],
    t.[transferDateTime],
    t.[sourceAccount],
    t.[destinationAccount],
    t.[issuerTxState],
    t.[transferAmount],
    t.[actualAmount],
    t.[replacementAmount],
    t.[description],
    t.[credentialId],
    t.[transferCurrency],
    t.[transferIdAcquirer],
    t.[merchantId],
    t.[transferTypeId],
    t.[cardId],
    t.[reversed],
    t.[reversedLedger],
    t.[settlementDate],
    t.[channelType],
    t.[localDateTime],
    t.[transferIdIssuer],
    t.[transferFee],
    t.[acquirerFee],
    t.[issuerFee],
    t.[retrievalReferenceNumber],
    t.[issuerSerialNumber],
    t.[issuerId],
    t.[processorFee],
    t.[credentialId],
    request.udfDetails [requestDetails],
    request.eventDateTime [requestDateTime],
    request.[type] [requestType],
    request.[message] [requestMessage],
    confirmIssuer.udfDetails [confirmIssuerDetails],
    confirmIssuer.eventDateTime [confirmIssuerDateTime],
    confirmIssuer.[type] [confirmIssuerType],
    confirmIssuer.[message] [confirmIssuerMessage],
    error.udfDetails [errorDetails],
    error.eventDateTime [errorDateTime],
    error.[type] [errorType],
    error.[message] [errorMessage],
    [reverse].udfDetails [reverseDetails],
    [reverse].eventDateTime [reverseDateTime],
    [reverse].[type] [reverseType],
    [reverse].[message] [reverseMessage],
    reverseError.udfDetails [reverseErrorDetails],
    reverseError.eventDateTime [reverseErrorDateTime],
    reverseError.[type] [reverseErrorType],
    reverseError.[message] [reverseErrorMessage],
    cardAlert.udfDetails [cardAlertDetails],
    cardAlert.eventDateTime [cardAlertDateTime],
    cardAlert.[type] [cardAlertType],
    cardAlert.[message] [cardAlertMessage],
    cashAlert.udfDetails [cashAlertDetails],
    cashAlert.eventDateTime [cashAlertDateTime],
    cashAlert.[type] [cashAlertType],
    cashAlert.[message] [cashAlertMessage],
    (CASE t.[issuerTxState]
        WHEN 1 THEN N'requested'
        WHEN 2 THEN N'confirmed'
        WHEN 3 THEN N'rejected'
        WHEN 4 THEN N'unknown'
        WHEN 5 THEN N'aborted'
        WHEN 6 THEN N'error'
        WHEN 7 THEN N'store requested'
        WHEN 8 THEN N'store confirmed'
        WHEN 9 THEN N'store unknown'
        WHEN 11 THEN N'forward requested'
        WHEN 12 THEN N'forward confirmed'
        WHEN 13 THEN N'forward denied'
        WHEN 14 THEN N'forward unknown'
        ELSE N''
    END) [issuerTxStateName],
    n.itemName [transferType],
    (CASE
        WHEN t.[reversed] = 1 AND (t.issuerId = t.ledgerId OR t.[reversedLedger] = 1) THEN N'transferReversed'
        WHEN t.[issuerTxState] IN (2, 8, 12) AND ISNULL(cardAlert.type, cashAlert.type) IS NOT NULL THEN N'transferAlert'
        WHEN t.channelType IN (N'iso', N'pos') AND t.[issuerTxState] IN (2, 8, 12) THEN N'transferNormal'
        WHEN t.[acquirerTxState] IN (2, 8, 12) THEN N'transferNormal'
        ELSE N'transferError'
    END) [style],
    CASE
        WHEN ISNULL(cashAlert.[message], N'') != '' AND ISNULL(cardAlert.[message], N'') != N'' THEN cashAlert.[message] + CHAR(10) + CHAR(13) + cardAlert.[message]
        ELSE ISNULL(cashAlert.[message], N'') + ISNULL(cardAlert.[message], N'')
    END AS alerts,
    CASE
        WHEN ((t.channelType IN ('iso', 'pos') AND t.[issuerTxState] IN (2, 8, 12)) OR [acquirerTxState] IN (2, 8, 12)) THEN 1
        ELSE 0
    END success,
    ISNULL(
        error.udfDetails.value('(/root/responseCode)[1]', 'VARCHAR(3)'),
        error.udfDetails.value('(/params/responseCode)[1]', 'VARCHAR(3)')
    ) responseCode
FROM
    [transfer].[transfer] t
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = N'request'
        AND [source] = N'acquirer'
        AND t.transferId = transferId
        ORDER BY eventId ASC
    ) request
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = N'confirm'
        AND [source] = N'issuer'
        AND t.transferId = transferId
        ORDER BY eventId ASC
    ) confirmIssuer
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE
            [state] IN (N'abort', N'fail', 'unknown') AND
            transferId = t.transferId AND
            source = CASE
                WHEN merchantTxState IS NOT NULL AND merchantTxState NOT IN (2, 8, 12) THEN 'merchant'
                WHEN issuerTxState IS NOT NULL AND issuerTxState NOT IN (2, 8, 12) THEN 'issuer'
                WHEN ledgerTxState IS NOT NULL AND ledgerTxState NOT IN (2, 8, 12) THEN 'ledger'
                ELSE 'acquirer'
            END
        ORDER BY eventId ASC
    ) error
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = N'reverse' AND t.transferId = transferId
        ORDER BY eventId ASC
    ) [reverse]
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = N'failReversal' AND t.transferId = transferId
        ORDER BY eventId ASC
    ) reverseError
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = N'alert' AND [type] = N'atm.cardReaderFault' AND t.transferId = transferId
        ORDER BY eventId ASC
    ) cardAlert
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = N'alert' AND [type] = N'atm.cashHandlerFault' AND t.transferId = transferId
        ORDER BY eventId ASC
    ) cashAlert
INNER JOIN
    [core].[itemName] n
        ON n.itemNameId = t.transferTypeId
