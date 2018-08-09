CREATE PROCEDURE [transfer].[payee.get] -- gets payee information
    @payeeId BIGINT, -- payee id in the system
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

DECLARE @languageId BIGINT = (SELECT languageId
FROM [core].[language] cl
JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
WHERE us.[actorId] = @userId)

IF @languageId IS NULL
    SET @languageId = (SELECT [languageId] FROM [core].[language] WHERE [name] = 'English')

SELECT p.payeeId, p.payeeName, p.accountTypeId, ISNULL(itt.itemNameTranslation, itn.itemName) AS accountType, p.accountNumber, p.bankName, p.SWIFT
FROM [transfer].payee p
JOIN core.itemName itn ON itn.itemNameId = p.accountTypeId
LEFT JOIN core.itemTranslation itt ON itt.itemNameId = itn.itemNameId AND languageId = @languageId
WHERE payeeId = @payeeId
