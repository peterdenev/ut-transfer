ALTER PROCEDURE [transfer].[payee.edit] -- edits payee information
    @payee [transfer].payeeTT READONLY, -- the edited payee information
    @noResultSet BIT = 0 -- a flag to show if result is expected
AS

DECLARE @result [transfer].payeeTT

BEGIN TRY

    DECLARE @tranCounter INT = @@TRANCOUNT;
    IF @tranCounter = 0
        BEGIN TRANSACTION

            UPDATE p
            SET p.payeeName = pp.payeeName,
                p.accountTypeId = pp.accountTypeId,
                p.accountNumber = pp.accountNumber,
                p.bankName = pp.bankName,
                p.SWIFT = pp.SWIFT
            OUTPUT INSERTED.payeeId, INSERTED.payeeName, INSERTED.accountTypeId, INSERTED.accountNumber, INSERTED.bankName, INSERTED.SWIFT
            INTO @result (payeeId, payeeName, accountTypeId, accountNumber, bankName, SWIFT)
            FROM [transfer].payee p
            INNER JOIN @payee pp ON p.payeeId = pp.payeeId

            IF @tranCounter = 0
        COMMIT TRANSACTION

    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'payee' AS resultSetName
        SELECT payeeId, payeeName, accountTypeId, accountNumber, bankName, SWIFT
        FROM @result
    END

END TRY
BEGIN CATCH
    IF @@trancount > 0
        ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
