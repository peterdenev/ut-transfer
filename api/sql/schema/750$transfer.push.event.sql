ALTER PROCEDURE [transfer].[push.event]
    @transferId BIGINT,
    @type VARCHAR(50),
    @state VARCHAR(50),
    @source VARCHAR(50),
    @message NVARCHAR(250),
    @udfDetails XML
AS
SET NOCOUNT ON

IF NOT EXISTS
    (SELECT *
    FROM [transfer].[transfer]
    WHERE transferId = @transferId)
BEGIN
    RAISERROR ('transfer.invalidTransferId', 16, 1)
    RETURN 5555
END

INSERT INTO
    [transfer].[event](eventDateTime, transferId, [type], [state], source, [message], udfDetails)
VALUES
    (GETDATE(), @transferId, @type, @state, @source, @message, @udfDetails)
