CREATE TABLE [transfer].[requestSource](
    [requestSourceId] [char] (6) NOT NULL,
    [description] [varchar] (50),
    -- aquire/switch/issuer
    CONSTRAINT [pkrequestSource] PRIMARY KEY ([requestSourceId])
)