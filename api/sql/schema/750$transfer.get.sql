ALTER PROCEDURE [transfer].[get]
    @transferId BIGINT,
	@meta core.metaDataTT READONLY
AS
BEGIN
    SELECT * FROM [transfer].[transfer]
    WHERE transferId = @transferId

END