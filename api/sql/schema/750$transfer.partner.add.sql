CREATE PROCEDURE [transfer].[partner.add] -- add new transfer partner in DB
    @partner [transfer].partnerTT READONLY,-- -- in this parameter the stored procedure receives all fields of transfer partner   
    @meta core.metaDataTT READONLY, -- information for the user that makes the operation
    @noResultSet bit = 0 -- this is the flag about the waited result
AS
    DECLARE @callParams XML
    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)
    DECLARE @result [transfer].partnerTT
    DECLARE @actorId BIGINT
    SET @noResultSet = ISNULL(@noResultSet, 0)
BEGIN TRY
    -- checks if the user has a right to make the operation
    declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    if @return != 0
    BEGIN
        RETURN 55555
    END
    --

    BEGIN TRANSACTION
        INSERT
            [core].[actor](actorType, isEnabled)
        VALUES
            (N'system', 1)

        SET @actorId = SCOPE_IDENTITY()

        INSERT INTO [transfer].[partner] (actorId, partnerId, [name], port, mode, settlementDate, settlementAccount, feeAccount, commissionAccount, serialNumber)
        OUTPUT INSERTED.* INTO @result
        SELECT @actorId, partnerId, name, port, mode, settlementDate, settlementAccount, feeAccount, commissionAccount, serialNumber
        FROM @partner

    COMMIT TRANSACTION

    IF (ISNULL(@noResultSet, 0) = 0)
    BEGIN
        SELECT 'partner' AS resultSetName
        SELECT * FROM @result
    END

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
   IF @@trancount > 0 ROLLBACK TRANSACTION

   IF error_number() not in (2627)
       BEGIN
          EXEC [core].[error]
       END
    ELSE
    BEGIN TRY
       RAISERROR('Partner with this id already exists', 16, 1);
    END TRY
    BEGIN CATCH
       EXEC [core].[error]
    END CATCH
END CATCH
