ALTER PROCEDURE [transfer].[reverse.fetchQueue] 
    @issuerChannelId char(4)
   
AS
    
    SELECT 'reverseQueue' AS resultSetName

  select [reverseQueueId]
      ,[transferId]
      ,[transferIdAcquirer]
      ,[reverseId]
      ,[reverseQueueStatusId]
      ,[retryCount]
      ,[issuerChannelId]
      ,[originalRequest]
 FROM [transfer].[reverseQueue]
 WHERE [reverseQueueStatusId] = 'pend'
  AND ([issuerChannelId] IS NULL
	OR (@issuerChannelId IS NULL OR [issuerChannelId] = @issuerChannelId)
	)