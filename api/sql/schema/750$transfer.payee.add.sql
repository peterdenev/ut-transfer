CREATE PROCEDURE [transfer].[payee.add] -- add new payee in DB
    @payee [transfer].payeeTT READONLY, -- -- in this parameter the stored procedure receives all fields of payee
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation
    @noResultSet BIT = 0 -- this is the flag about the waited result
AS

DECLARE @result [transfer].payeeTT
SET @noResultSet = ISNULL(@noResultSet, 0)

BEGIN TRY

    INSERT INTO [transfer].[payee] (userId, payeeName, accountTypeId, accountNumber, bankName, SWIFT)
    OUTPUT INSERTED.* INTO @result
    SELECT userId, payeeName, accountTypeId, accountNumber, bankName, SWIFT
    FROM @payee


    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'payee' AS resultSetName
        SELECT userId, payeeName, accountTypeId, accountNumber, bankName, SWIFT
        FROM @result
    END

END TRY
BEGIN CATCH
    IF @@trancount > 0
        ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH

