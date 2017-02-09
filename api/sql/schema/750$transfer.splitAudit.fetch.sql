ALTER PROCEDURE [transfer].[splitAudit.fetch] -- fetch splitAudit for splitId
    @splitId BIGINT, -- splitId
	@meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    SELECT 'splitAudit' as resultSetName
    SELECT s.*, p.firstName, p.lastName
    FROM transfer.splitAudit s
    JOIN customer.person p ON p.actorId = s.createdBy
    WHERE splitId= @splitId
