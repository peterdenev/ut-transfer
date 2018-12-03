CREATE TYPE [transfer].[filterByTT] AS TABLE(
    transferDateTimeFrom DATETIME,
    transferDateTimeTo DATETIME,
    transferTypeId BIGINT
)