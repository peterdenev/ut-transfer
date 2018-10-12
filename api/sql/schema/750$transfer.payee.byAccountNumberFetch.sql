ALTER PROCEDURE [transfer].[payee.byAccountNumberFetch] -- gets all payees by list of account numbers
    @accountNumber core.arrayList READONLY, -- list of account numbers
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

SELECT 'payeeAccounts' AS resultSetName
SELECT an.value AS accountNumber, p.payeeName
FROM @accountNumber an
LEFT JOIN [transfer].payee p ON p.accountNumber = an.value AND [userId] = @userId
ORDER BY accountNumber ASC



