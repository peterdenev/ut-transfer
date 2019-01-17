ALTER PROCEDURE [transfer].[bank.list] -- gets list of banks and their swift codes
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS

SELECT 'banks' AS resultSetName

SELECT swift, bankName, isDefault
FROM [transfer].bank
ORDER BY isDefault DESC, bankName ASC
