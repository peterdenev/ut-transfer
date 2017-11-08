CREATE TABLE [transfer].[issuerTxState](
    [issuerTxStateId] [char] (5) NOT NULL,
    [description] [varchar] (100),
    
    CONSTRAINT [pkissuerTxState] PRIMARY KEY ([issuerTxStateId])
)