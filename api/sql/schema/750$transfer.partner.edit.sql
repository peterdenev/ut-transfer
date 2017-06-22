ALTER PROCEDURE [transfer].[partner.edit]  -- edits transfer partner information
    @partner [transfer].partnerTT READONLY, -- the edited partner information
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    DECLARE @callParams XML
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta) -- the id of the user that makes the operation

BEGIN TRY

    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END

    DECLARE @languageId BIGINT = (SELECT languageId
                        FROM [core].[language] cl
                        JOIN [user].[session] us ON us.[language] = cl.[iso2Code]
                        WHERE us.[actorId] = @userId)

    BEGIN TRANSACTION
        UPDATE p
        SET p.name = pa.name,
            p.port = pa.port,
            p.mode = pa.mode,
            p.settlementDate = pa.settlementDate,
            p.settlementAccount = pa.settlementAccount,
            p.feeAccount = pa.feeAccount,
            p.commissionAccount = pa.commissionAccount,
            p.serialNumber = pa.serialNumber
        FROM [transfer].partner p
        INNER JOIN @partner pa ON p.partnerId = pa.partnerId
    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
   IF @@trancount > 0 ROLLBACK TRANSACTION
   BEGIN
       EXEC [core].[error]
   END
END CATCH
