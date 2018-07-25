ALTER PROCEDURE [transfer].[payee.edit] -- edits payee information
    @payee [transfer].payeeTT READONLY, -- the edited payee information
    @actorId BIGINT, -- user id/owner of the payee
    @noResultSet BIT = 0 -- a flag to show if result is expected
AS

DECLARE @result [transfer].payeeTT

BEGIN TRY

    DECLARE @tranCounter INT = @@TRANCOUNT;
    IF @tranCounter = 0
        BEGIN TRANSACTION
            DELETE p
            FROM [transfer].payee p
            LEFT JOIN @payee pp ON p.payeeId = pp.payeeId
            WHERE p.userId = @actorId AND pp.payeeId IS NULL

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

            INSERT INTO [transfer].payee (payeeName, accountTypeId, accountNumber, bankName, SWIFT)
            OUTPUT INSERTED.payeeId, INSERTED.payeeName, INSERTED.accountTypeId, INSERTED.accountNumber, INSERTED.bankName, INSERTED.SWIFT
            INTO @result (payeeId, payeeName, accountTypeId, accountNumber, bankName, SWIFT)
            SELECT payeeName, accountTypeId, accountNumber, bankName, SWIFT
            FROM [transfer].payee p
            WHERE p.payeeId IS NULL

            IF @tranCounter = 0
        COMMIT TRANSACTION

    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'payee' AS resultSetName
        SELECT payeeId, payeeName, accountTypeId, accountNumber, bankName, SWIFT FROM @result
    END

END TRY
BEGIN CATCH
    IF @@trancount > 0
        ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
