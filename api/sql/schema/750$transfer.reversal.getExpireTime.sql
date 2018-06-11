ALTER FUNCTION [transfer].[reversal.getExpireTime] (@retryCount INT, @opcode VARCHAR(20))
RETURNS DATETIME
AS
BEGIN
	RETURN
	CASE
		WHEN 5 > ISNULL(@retryCount, 0) THEN DATEADD(SECOND, 30, GETDATE())
		WHEN 10 > @retryCount THEN DATEADD(SECOND, 60, GETDATE())
		WHEN 15 > @retryCount THEN DATEADD(MINUTE, 30, GETDATE())
		WHEN 20 > @retryCount THEN DATEADD(HOUR, 1, GETDATE())
	END
END
