ALTER PROCEDURE [transfer].[push.failIssuer]
    @transferId bigint,
    @type varchar(50),
    @message varchar(250),
    @issuerResponseCode varchar(10), 
    @issuerResponseMessage varchar(250),
    @details XML,
    @transferIdAcquirer varchar(50),
    @queueReversal bit,
    @issuerChannelId char(4),
    @originalRequest TEXT
AS
SET NOCOUNT ON

UPDATE
    [transfer].[transfer]
SET
    issuerTxState = CASE WHEN @queueReversal = 1
            THEN 4
            ELSE 3
            END,
    issuerResponseCode=@issuerResponseCode,
    issuerResponseMessage=@issuerResponseMessage
WHERE
    transferId = @transferId 

IF @queueReversal IS NOT NULL AND @queueReversal = 1
BEGIN
    INSERT INTO [transfer].[reverseQueue] (transferId, transferIdAcquirer, reverseQueueStatusId, retryCount, issuerChannelId, originalRequest, createdOn, updatedOn)
    SELECT 
        @transferId,
        @transferIdAcquirer,
        'pend',
        0,
        @issuerChannelId,
        @originalRequest,
        GETDATE(),
        GETDATE()
    
END

EXEC [transfer].[push.eventFailed]
    @transferId = @transferId,
    @type = @type,
    @state = 'fail',
    @source = 'issuer',
    @message = @message,
    @responseMessage=@issuerResponseMessage,
    @responseCode=@issuerResponseCode,
    @issuerChannelId=@issuerChannelId,
    @udfDetails = @details

