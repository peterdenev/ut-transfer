CREATE TABLE [transfer].[reverseQueue](
    reverseQueueId bigint IDENTITY(1,1) NOT NULL,
    transferId bigint NOT NULL,
    transferIdAcquirer varchar(50) NOT NULL,
    reverseId bigint NULL,
    reverseQueueStatusId char(4), -- fail/pend/sent/sndg
    retryCount int,
    issuerChannelId char(4) NULL,
    originalRequest TEXT NULL,
    createdBy BIGINT  NULL,
    createdOn DATETIME NULL, 
    updatedBy BIGINT NULL,
    updatedOn DATETIME NULL,
    CONSTRAINT [pkТransferReverseQueue] PRIMARY KEY CLUSTERED (reverseQueueId ASC)
)