CREATE TABLE [transfer].typeAlias( --table that stores type Alias
    [type] VARCHAR(50) NOT NULL, --short name of type
    [description] [nvarchar](50) NOT NULL,--description of the type of Alias
    CONSTRAINT [pkTypeAlias] PRIMARY KEY CLUSTERED([type] ASC)
)