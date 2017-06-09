CREATE PROCEDURE [transfer].[reason.list] -- add new transfer reason in DB
    @action NVARCHAR (50), --the action ids for which this reason is valid
    @meta core.metaDataTT READONLY -- information for the user that makes the operation

AS

    DECLARE @userId BIGINT = (SELECT [auth.actorId] FROM @meta)

    -- checks if the user has a right to make the operation
    --declare @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    --exec @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    --if @return != 0
    --BEGIN
    --    RETURN 55555
    --END

    DECLARE @languageId BIGINT = ISNULL((
        SELECT
            languageId
        FROM
            [core].[language] cl
        JOIN
            [user].[session] us ON us.[language] = cl.[iso2Code]
        WHERE
            us.[actorId] = @userId), (
        SELECT
            [languageId]
        FROM
            [core].[language]
        WHERE
            [name] = 'English'))

    SELECT 'transferReasonList' AS resultSetName

    SELECT
        itn.itemNameId, itn.itemName, ittr.itemNameTranslation
    FROM
        core.itemName itn
    JOIN
        core.itemType itt ON itt.itemTypeId = itn.itemTypeId
    JOIN
        core.itemTranslation ittr ON ittr.itemNameId = itn.itemNameId
    WHERE
        itt.alias = 'transferReason' + @action AND languageId = @languageId
