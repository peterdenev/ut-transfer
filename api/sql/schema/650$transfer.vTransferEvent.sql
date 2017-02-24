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
    request.udfDetails [requestDetails],
    request.eventDateTime [requestDateTime],
    request.type [requestType],
    request.message [requestMessage],
    error.udfDetails [errorDetails],
    error.eventDateTime [errorDateTime],
    error.type [errorType],
    error.message [errorMessage],
    reverse.udfDetails [reverseDetails],
    reverse.eventDateTime [reverseDateTime],
    reverse.type [reverseType],
    reverse.message [reverseMessage],
    reverseError.udfDetails [reverseErrorDetails],
    reverseError.eventDateTime [reverseErrorDateTime],
    reverseError.type [reverseErrorType],
    reverseError.message [reverseErrorMessage],
    cardAlert.udfDetails [cardAlertDetails],
    cardAlert.eventDateTime [cardAlertDateTime],
    cardAlert.type [cardAlertType],
    cardAlert.message [cardAlertMessage],
    cashAlert.udfDetails [cashAlertDetails],
    cashAlert.eventDateTime [cashAlertDateTime],
    cashAlert.type [cashAlertType],
    cashAlert.message [cashAlertMessage],
    (CASE t.[issuerTxState]
        WHEN 1 THEN 'requested'
        WHEN 2 THEN 'confirmed'
        WHEN 3 THEN 'denied'
        WHEN 4 THEN 'timed out'
        WHEN 5 THEN 'aborted'
        WHEN 6 THEN 'error'
        WHEN 7 THEN 'store requested'
        WHEN 8 THEN 'store confirmed'
        WHEN 9 THEN 'store timed out'
        WHEN 11 THEN 'forward requested'
        WHEN 12 THEN 'forward confirmed'
        WHEN 13 THEN 'forward denied'
        WHEN 14 THEN 'forward timed out'
        ELSE ''
    END) [issuerTxStateName],
    n.itemName [transferType],
    (CASE
        WHEN t.[reversed] = 1 THEN 'transferReversed'
        WHEN t.[issuerTxState] in (2, 8, 12) AND ISNULL(cardAlert.type, cashAlert.type) IS NOT NULL THEN 'transferAlert'
        WHEN t.[acquirerTxState] in (2, 8, 12) THEN 'transferNormal'
        ELSE 'transferError'
    END) [style],
    CASE
        WHEN ISNULL(cashAlert.message, '') != '' AND ISNULL(cardAlert.message, '') != '' THEN cashAlert.message + CHAR(10) + CHAR(13) + cardAlert.message
        ELSE ISNULL(cashAlert.message, '') + ISNULL(cardAlert.message, '')
    END as alerts
FROM
    [transfer].[vTransfer] t
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = 'request' AND t.transferId = transferId
        ORDER BY transferId ASC
    ) request
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] in ('abort', 'fail') AND t.transferId = transferId
        ORDER BY transferId ASC
    ) error
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = 'reverse' AND t.transferId = transferId
        ORDER BY transferId ASC
    ) reverse
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = 'failReversal' AND t.transferId = transferId
        ORDER BY transferId ASC
    ) reverseError
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = 'fail' AND [type] = 'atm.cardReaderFault' AND t.transferId = transferId
        ORDER BY transferId ASC
    ) cardAlert
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = 'fail' AND [type] = 'atm.cashHandlerFault' AND t.transferId = transferId
        ORDER BY transferId ASC
    ) cashAlert
INNER JOIN
    [core].[itemName] n
        ON n.itemNameId = t.transferTypeId