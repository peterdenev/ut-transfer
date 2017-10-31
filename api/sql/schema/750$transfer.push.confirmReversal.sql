ALTER PROCEDURE [transfer].[push.confirmReversal]
    @transferId bigint,
    @isPartialReversal bit
AS
SET NOCOUNT ON
-- TODO: VEFIRY IF THIS LOGIC GOES IN HERE
DECLARE @partialOrFullReversal int

IF @isPartialReversal IS NOT NULL
    BEGIN 
     SET @partialOrFullReversal = 0
    END
ELSE 
    BEGIN
        SET @partialOrFullReversal = 1
    END
--
BEGIN TRY
    BEGIN TRANSACTION

    UPDATE
        [transfer].[transfer]
    SET
        reversed = @partialOrFullReversal,
        isPartialReversal = @isPartialReversal
    WHERE
        transferId = @transferId

    IF @@ROWCOUNT <> 1 RAISERROR('transfer.confirmReversal', 16, 1);

    UPDATE
        [transfer].[pending]
    SET
        [status] = NULL,
        pushTransactionId = NULL
    WHERE
        pushTransactionId=@transferId

    EXEC [transfer].[push.event]
        @transferId = @transferId,
        @type = 'transfer.reverse',
        @state = 'reverse',
        @source = 'acquirer',
        @message = 'Transaction was succesfully reversed',
        @udfDetails = null

    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    if @@TRANCOUNT > 0 ROLLBACK TRANSACTION
    EXEC core.error
    RETURN 55555
END CATCH

