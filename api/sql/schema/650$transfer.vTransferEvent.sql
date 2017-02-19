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
    te.udfDetails [requestDetails],
    te.eventDateTime [requestDateTime],
    te.type [requestType],
    te.message [requestMessage],
    tee.udfDetails [errorDetails],
    tee.eventDateTime [errorDateTime],
    tee.type [errorType],
    tee.message [errorMessage],
    ter.udfDetails [reverseDetails],
    ter.eventDateTime [reverseDateTime],
    ter.type [reverseType],
    ter.message [reverseMessage],
    tere.udfDetails [reverseErrorDetails],
    tere.eventDateTime [reverseErrorDateTime],
    tere.type [reverseErrorType],
    tere.message [reverseErrorMessage],
    n.itemName [transferType]
FROM
    [transfer].[vTransfer] t
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = 'request' AND t.transferId = transferId
        ORDER BY transferId ASC
    ) te
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] in ('abort', 'fail') AND t.transferId = transferId
        ORDER BY transferId ASC
    ) tee
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = 'reverse' AND t.transferId = transferId
        ORDER BY transferId ASC
    ) ter
OUTER APPLY
    (
        SELECT TOP 1 udfDetails, transferId, [type], [message], eventDateTime
        FROM [transfer].[event]
        WHERE [state] = 'failReversal' AND t.transferId = transferId
        ORDER BY transferId ASC
    ) tere
INNER JOIN
    [core].[itemName] n
        ON n.itemNameId = t.transferTypeId