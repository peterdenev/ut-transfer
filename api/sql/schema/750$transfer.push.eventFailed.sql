ALTER PROCEDURE [transfer].[push.eventFailed]
    @transferId bigint,
    @type varchar(50),
    @issuerChannelId char(4),
    @state varchar(50),
    @source varchar(50),
    @responseCode varchar(10), 
    @responseMessage varchar(250),
    @message nvarchar(250),
    @udfDetails XML
AS
SET NOCOUNT ON

IF NOT EXISTS (SELECT *
               FROM [transfer].[transfer]
               WHERE transferId = @transferId)
BEGIN
    RAISERROR ('transfer.invalidTransferId', 16, 1)
    RETURN 5555
END

INSERT INTO
    [transfer].[eventFailed](eventDateTime, transferId, [type], [state], source, [responseMessage], udfDetails,issuerChannelId,responseCode,[message])
VALUES
    (GETDATE(), @transferId, @type, @state, @source, @responseMessage, @udfDetails,@issuerChannelId,@responseCode,@message)
