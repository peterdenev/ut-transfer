ALTER PROCEDURE [transfer].[payee.fetch] -- gets all payees for user
    @payeeName NVARCHAR(100) = NULL, -- full or part of the payee name for search
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

SELECT 'payees' AS resultSetName
SELECT p.payeeId, p.payeeName, p.accountNumber, p.bankName, p.SWIFT
FROM [transfer].payee p
WHERE isDeleted = 0
    AND userId = @userId
    AND (@payeeName IS NULL OR p.payeeName LIKE '%' + @payeeName + '%')
ORDER BY p.payeeName
