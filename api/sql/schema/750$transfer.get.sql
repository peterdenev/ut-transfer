ALTER PROCEDURE [transfer].[get]
    @transferId BIGINT,
	@meta core.metaDataTT READONLY
AS
BEGIN
    SELECT
        t.*
        ,n.itemCode AS transferType
    FROM [transfer].[transfer] t
    JOIN [core].[itemName] n ON n.itemNameId = t.transferTypeId
    WHERE transferId = @transferId

END