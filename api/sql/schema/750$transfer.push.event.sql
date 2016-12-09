ALTER PROCEDURE [transfer].[push.event]
    @transferId bigint,
    @type varchar(50),
    @source varchar(50),
    @message nvarchar(250),
    @udfDetails XML
AS
SET NOCOUNT ON

INSERT INTO
    [transfer].[event](eventDateTime, transferId, [type], source, [message], udfDetails)
VALUES
    (GETDATE(), @transferId, @type, @source, @message, @udfDetails)
