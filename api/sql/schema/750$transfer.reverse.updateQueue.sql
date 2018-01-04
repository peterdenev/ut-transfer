ALTER PROCEDURE [transfer].[reverse.updateQueue] 
    @queueStatus char(4),
    @queueIds [core].[idListTT] READONLY
AS
    
update [transfer].[reverseQueue]
set reverseQueueStatusId = @queueStatus,
    updatedOn = GETDATE(),
    retryCount=CASE WHEN @queueStatus='pend' THEN retryCount+1 ELSE retryCount END
WHERE reverseQueueId IN (SELECT id FROM @queueIds)

