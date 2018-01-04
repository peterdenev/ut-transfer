ALTER PROCEDURE [transfer].[reverse.updateQueue] 
    @queueStatus char(4),
    @queueIds [core].[idListTT] READONLY
AS
    
update [transfer].[reverseQueue]
set reverseQueueStatusId = @queueStatus,
    updatedOn = GETDATE()
WHERE reverseQueueId IN (SELECT id FROM @queueIds)

