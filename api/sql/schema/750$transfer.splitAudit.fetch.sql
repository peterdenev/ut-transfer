ALTER PROCEDURE [transfer].[splitAudit.fetch] -- fetch splitAudit for splitId
    @splitId BIGINT, -- splitId
	@meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    SELECT 'splitAudit' as resultSetName
    SELECT s.id, s.splitId, s.field, 
    CASE 
        WHEN s.field ='status' AND s.oldValue IS NULL THEN 'Pending Autorization'
        WHEN s.field ='status' AND s.oldValue = '2' THEN  'Posted' 
        WHEN s.field ='status' AND s.oldValue = '5' THEN  'Rejected' 
        WHEN s.field ='status' AND s.oldValue = '4' THEN  'Authorized' 
        ELSE s.oldValue
    END AS oldValue, 
    s.createdOn,
    p.firstName, p.lastName
    FROM transfer.splitAudit s
    JOIN customer.person p ON p.actorId = s.createdBy
    WHERE splitId= @splitId
