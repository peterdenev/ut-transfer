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
SELECT 'echotsMip1','1990-01-01','The last time when a echo message was sent'
UNION
SELECT 'signonMip1','1990-01-01','The last time when a Sign-on message was sent.'
UNION
SELECT 'signofMip1','1990-01-01','The last time when a Sign-off message was sent.'
UNION 
SELECT 'echotsMip2','1990-01-01','The last time when a echo message was sent'
UNION
SELECT 'signonMip2','1990-01-01','The last time when a Sign-on message was sent.'
UNION
SELECT 'signofMip2','1990-01-01','The last time when a Sign-off message was sent.'
END