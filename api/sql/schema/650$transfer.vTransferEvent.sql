ALTER VIEW [transfer].[vTransferEvent]
AS
SELECT
    t.[transferId],
    t.[transferDateTime],
    t.[sourceAccount],
    t.[destinationAccount],
    t.[issuerTxState],
    t.[transferAmount],
    t.[description],
    t.[transferCurrency],
    t.[transferIdAcquirer],
    t.[merchantId],
    t.[transferTypeId],
    t.[cardId],
    t.[reversed],
    t.[settlementDate],
    t.[channelType],
    t.[localDateTime],
    t.[transferIdIssuer],
    t.[acquirerFee],
    t.[issuerFee],
    t.[retrievalReferenceNumber],
    t.[issuerSerialNumber],
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
        WHEN 3 THEN N'denied'
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
        WHEN t.[reversed] = 1 THEN N'transferReversed'
        WHEN t.[issuerTxState] in (2, 8, 12) AND ISNULL(cardAlert.type, cashAlert.type) IS NOT NULL THEN N'transferAlert'
        WHEN t.channelType = N'iso' AND t.[issuerTxState] IN (2, 8, 12)  THEN N'transferNormal'
        WHEN t.[acquirerTxState] in (2, 8, 12) THEN N'transferNormal'
        ELSE N'transferError'
    END) [style],
    CASE
        WHEN ISNULL(cashAlert.[message], N'') != '' AND ISNULL(cardAlert.[message], N'') != N'' THEN cashAlert.[message] + CHAR(10) + CHAR(13) + cardAlert.[message]
        ELSE ISNULL(cashAlert.[message], N'') + ISNULL(cardAlert.[message], N'')
    END as alerts,
    CASE
        WHEN ((t.channelType = 'iso' AND t.[issuerTxState] IN (2, 8, 12)) OR [acquirerTxState] in (2, 8, 12)) THEN 1
        ELSE 0
    END success    
FROM
    [transfer].[transfer] t
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE   [state] = N'request' 
        AND     [source] = N'acquirer'
        AND     t.transferId = transferId
        ORDER BY eventId ASC
    ) request
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE   [state] = N'confirm' 
        AND     [source] = N'issuer'
        AND     t.transferId = transferId
        ORDER BY eventId ASC
    ) confirmIssuer
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] in (N'abort', N'fail') AND t.transferId = transferId
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
        WHERE [state] = N'fail' AND [type] = N'atm.cardReaderFault' AND t.transferId = transferId
        ORDER BY eventId ASC
    ) cardAlert
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = N'fail' AND [type] = N'atm.cashHandlerFault' AND t.transferId = transferId
        ORDER BY eventId ASC
    ) cashAlert
INNER JOIN
    [core].[itemName] n
        ON n.itemNameId = t.transferTypeId