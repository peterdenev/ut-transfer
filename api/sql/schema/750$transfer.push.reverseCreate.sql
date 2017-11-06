ALTER PROCEDURE [transfer].[push.reverseCreate]
    @transferId bigint,
    @reverseAmount money,
    @isPartial BIT = 0,
    @issuerId varchar(50),
    @transferDateTime datetime = NULL,
    @localDateTime varchar(14) = NULL
AS

INSERT INTO
[transfer].[reverse] (
    transferId,
    reverseAmount,
    isPartial,
    issuerTxState,
    issuerId,
    transferDateTime,
    localDateTime,
    createdOn,
    updatedOn
)
OUTPUT
    INSERTED.*
VALUES (
    @transferId,
    @reverseAmount,
    @isPartial,
    1,
    @issuerId,
    @transferDateTime,
    @localDateTime,
    GETDATE(),
    GETDATE()
)

EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = 'transfer.reverse',
    @state = 'request',
    @source = 'acquirer',
    @message = NULL,
    @udfDetails = NULL

