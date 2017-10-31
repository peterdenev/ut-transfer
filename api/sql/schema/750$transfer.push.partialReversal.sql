ALTER PROCEDURE [transfer].[push.partialReversal]
    @transferId bigint,
    @transferDateTime datetime,
    @localDateTime varchar(14),
    @replacementAmount money,    
	@networkData varchar(20),
	@originalRequest varchar(2000),
    @udfAcquirer XML,
    @meta core.metaDataTT READONLY
AS
DECLARE @callParams XML = ( SELECT @transferDateTime [transferDateTime], @localDateTime [localDateTime], @replacementAmount [transferAmount], @networkData [networkData], @originalRequest [originalRequest], @transferId [originalTransferId] , @udfAcquirer [udfAcquirer], (SELECT * from @meta rows FOR XML AUTO, TYPE) [meta] FOR XML RAW('params'),TYPE)
DECLARE  @userId bigint
BEGIN TRY
    -- checks if the user has a right to make the operation
    DECLARE @actionID varchar(100) =  OBJECT_SCHEMA_NAME(@@PROCID) + '.' +  OBJECT_NAME(@@PROCID), @return int = 0
    EXEC @return = [user].[permission.check] @actionId =  @actionID, @objectId = null, @meta = @meta
    IF @return != 0
    BEGIN
        RETURN 55555
    END

    SET @userId = (SELECT [auth.actorId] FROM @meta)

    BEGIN TRANSACTION

    INSERT INTO [transfer].[reverse](
		originalTransferId,
        transferDateTime,
        localDateTime,
        transferAmount,
        networkData,
        originalRequest
    )
    OUTPUT
        INSERTED.*
    SELECT
        @transferId,
        @transferDateTime,
        ISNULL(@localDateTime, REPLACE(REPLACE(REPLACE(CONVERT(varchar, @transferDateTime, 120),'-',''),':',''),' ','')),
        @replacementAmount,
        @networkData,
        @originalRequest

    DECLARE @transferIdAux BIGINT = @@IDENTITY

    EXEC [transfer].[push.event]
        @transferId = @transferIdAux,
        @type = 'transfer.push',
        @state = 'request',
        @source = 'acquirer',
        @udfDetails = @udfAcquirer,
        @message = 'Transfer created'

    COMMIT TRANSACTION

    EXEC core.auditCall @procid = @@PROCID, @params = @callParams
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    IF error_number() not in (2627)
        BEGIN
DECLARE @CORE_ERROR_FILE_281 sysname='c:\UT5\impl-alignet-mastercard\node_modules\ut-transfer\api\sql\schema/750$transfer.push.partialReverse.sql' DECLARE @CORE_ERROR_LINE_281 int='282' EXEC [core].[errorStack] @procid=@@PROCID, @file=@CORE_ERROR_FILE_281, @fileLine=@CORE_ERROR_LINE_281, @params = @callParams
        END
    ELSE
    BEGIN TRY
        RAISERROR('transfer.idAlreadyExists', 16, 1);
    END TRY
    BEGIN CATCH
DECLARE @CORE_ERROR_FILE_288 sysname='c:\UT5\impl-alignet-mastercard\node_modules\ut-transfer\api\sql\schema/750$transfer.push.partialReverse.sql' DECLARE @CORE_ERROR_LINE_288 int='289' EXEC [core].[errorStack] @procid=@@PROCID, @file=@CORE_ERROR_FILE_288, @fileLine=@CORE_ERROR_LINE_288, @params = @callParams
    END CATCH
END CATCH