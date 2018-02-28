CREATE TYPE [transfer].[filterByTT] AS TABLE( --table type variable used for data filtering in stored procedures
    partnerId NVARCHAR(50),
    name NVARCHAR(50),
    port NVARCHAR(50),
    mode NVARCHAR(20)
)
