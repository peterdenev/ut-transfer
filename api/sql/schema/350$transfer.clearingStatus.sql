CREATE TABLE [transfer].[clearingStatus](
    [clearingStatusId] [char] (6) NOT NULL,
    [description] [varchar] (50),
    
    CONSTRAINT [pkclearingStatus] PRIMARY KEY ([clearingStatusId])
)