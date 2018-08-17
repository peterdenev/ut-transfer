CREATE PROCEDURE [transfer].[payee.delete] -- deletes payee information
    @payeeId BIGINT
AS

BEGIN TRY
    UPDATE p
    SET p.isDeleted = 1
    FROM [transfer].payee p
    WHERE p.payeeId = @payeeId
END TRY
BEGIN CATCH
    IF @@trancount > 0
        ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
