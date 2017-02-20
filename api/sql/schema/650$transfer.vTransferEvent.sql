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
    n.itemName [transferType]
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
        WHERE [state] = 'alert' AND [type] = 'atm.cardReaderFault' AND t.transferId = transferId
        ORDER BY transferId ASC
    ) cardAlert
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = 'alert' AND [type] = 'atm.cashHandlerFault' AND t.transferId = transferId
        ORDER BY transferId ASC
    ) cashAlert
INNER JOIN
    [core].[itemName] n
        ON n.itemNameId = t.transferTypeId