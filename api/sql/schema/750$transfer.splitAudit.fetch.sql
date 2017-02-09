ALTER PROCEDURE [transfer].[splitAudit.fetch] -- fetch splitAudit for splitId
    @splitId BIGINT, -- splitId
	@meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    SELECT 'splitAudit' as resultSetName
    SELECT *
    FROM transfer.splitAudit
    WHERE splitId= @splitId
