ALTER PROCEDURE [transfer].[push.reverseCreate]
    @transferId bigint,
    @reverseAmount money,
    @isPartial BIT = 0,
    @issuerId varchar(50),
    @issuerChannelId char(4),
    @transferIdAcquirer varchar(50) = NULL,
    @transferDateTime datetime2(0) = NULL,
    @localDateTime varchar(14) = NULL
AS
DECLARE @reverseId BIGINT
INSERT INTO
[transfer].[reverse] (
    transferId,
    reverseAmount,
    isPartial,
    issuerTxState,
    issuerId,
    issuerChannelId,
    transferDateTime,
    localDateTime,
    transferIdAcquirer,
    createdOn,
    updatedOn
)
VALUES (
    @transferId,
    @reverseAmount,
    @isPartial,
    1,
    @issuerId,
    @issuerChannelId,
    ISNULL(@transferDateTime, GETDATE()),
    @localDateTime,
    @transferIdAcquirer,
    SYSDATETIMEOFFSET(),
    SYSDATETIMEOFFSET()
)
SET @reverseId=SCOPE_IDENTITY()

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = 'transfer.reverse',
    @state = 'request',
    @source = 'acquirer',
    @message = NULL,
    @udfDetails = NULL

SELECT @reverseId reverseId 

