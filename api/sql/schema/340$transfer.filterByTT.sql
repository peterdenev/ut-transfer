CREATE TYPE [transfer].[filterByTT] AS TABLE( --table type variable used for data filtering in stored procedures
    partnerId nvarchar(50),
    name nvarchar(50),
    port  nvarchar(50),
    mode  nvarchar(20)
)
