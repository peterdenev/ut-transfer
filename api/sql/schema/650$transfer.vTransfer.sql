CREATE VIEW [transfer].vTransfer AS
SELECT
    *
FROM
    [transfer].[transfer]
WHERE
    IsNull(reversed, 0) = 0
