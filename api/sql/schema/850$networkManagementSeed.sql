IF NOT EXISTS (SELECT TOP 1 1 from [transfer].networkManagementSetting)
BEGIN
INSERT INTO [transfer].networkManagementSetting
SELECT 'T',60
UNION
SELECT 'E',50

END


IF NOT EXISTS (SELECT * from [transfer].[networkStatus])
BEGIN
INSERT INTO [transfer].[networkStatus]
SELECT 'echots','1990-01-01','The last time when a echo message was sent'
UNION
SELECT 'signon','1990-01-01','The last time when a Sign-on message was sent.'
UNION
SELECT 'signof','1990-01-01','The last time when a Sign-off message was sent.'
END