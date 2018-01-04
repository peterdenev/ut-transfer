ALTER PROCEDURE [transfer].[push.reverseCreate]
    @transferId bigint,
    @reverseAmount money,
    @isPartial BIT = 0,
    @issuerId varchar(50),
    @transferDateTime datetime2(0) = NULL,
    @localDateTime varchar(14) = NULL
AS
DECLARE @reverseId BIGINT=(SELECT TOP 1 reverseId FROM [transfer].[reverse] 
	   WHERE 
		  requestSourceId = 'switch'
	   AND [issuerTxState] = 4
	   AND [issuerResponseCode] = 92
	   AND transferId=@transferId )

IF @reverseId IS NULL
BEGIN
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
    VALUES (
	   @transferId,
	   @reverseAmount,
	   @isPartial,
	   1,
	   @issuerId,
	   ISNULL(@transferDateTime, GETDATE()),
	   @localDateTime,
	   SYSDATETIMEOFFSET(),
	   SYSDATETIMEOFFSET()
    )
    SET @reverseId=SCOPE_IDENTITY() 
END
EXEC [transfer].[push.event]
    @transferId = @transferId,
    @type = 'transfer.reverse',
    @state = 'request',
    @source = 'acquirer',
    @message = NULL,
    @udfDetails = NULL

SELECT @reverseId reverseId 

