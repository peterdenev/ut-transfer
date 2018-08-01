CREATE PROCEDURE [transfer].[payee.delete] -- deletes payee information
    @payeeId BIGINT
AS

BEGIN TRY

    DECLARE @tranCounter INT = @@TRANCOUNT;
    IF @tranCounter = 0
        BEGIN TRANSACTION

            UPDATE p
            SET p.isDeleted = 1
            FROM [transfer].payee p
            WHERE p.payeeId = @payeeId

            IF @tranCounter = 0
        COMMIT TRANSACTION

END TRY
BEGIN CATCH
    IF @@trancount > 0
        ROLLBACK TRANSACTION
    EXEC [core].[error]
END CATCH
