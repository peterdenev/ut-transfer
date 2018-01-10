ALTER PROCEDURE [transfer].[networkManagement.status]    
AS
DECLARE @settingPeriod INT=(SELECT [value] FROM [transfer].networkManagementSetting WHERE networkManagementSettingId='T' )
DECLARE @settingErrorNumber INT=(SELECT [value] FROM [transfer].networkManagementSetting WHERE networkManagementSettingId='E' )
DECLARE @dateFrom datetime2(0)
DECLARE @dateTo datetime2(0)=GETDATE()
DECLARE @lastEchoTestMip1 datetime2(0)
DECLARE @lastSignOnMip1 datetime2(0)
DECLARE @lastSignOffMip1 datetime2(0)
DECLARE @countTimeOutMip1 int
DECLARE @countFormatErrorMip1 int
DECLARE @lastEchoTestMip2 datetime2(0)
DECLARE @lastSignOnMip2 datetime2(0)
DECLARE @lastSignOffMip2 datetime2(0)
DECLARE @countTimeOutMip2 int
DECLARE @countFormatErrorMip2 int

SET @lastEchoTestMip1=(SELECT lastUpdated FROM [transfer].[networkStatus] WHERE networkStatusId='echotsMip1')
SET @lastSignOnMip1=(SELECT lastUpdated FROM [transfer].[networkStatus] WHERE networkStatusId='signonMip1')
SET @lastSignOffMip1=(SELECT lastUpdated FROM [transfer].[networkStatus] WHERE networkStatusId='signofMip1')
SELECT @countTimeOutMip1= sum(CASE WHEN responseCode=68 THEN 1 ELSE 0 END)
	  ,@countFormatErrorMip1 = sum(CASE WHEN responseCode=30 THEN 1 ELSE 0 END)
	  FROM 
	  [transfer].eventFailed e
	  WHERE e.eventDateTime BETWEEN  @dateFrom AND @dateTo
	  AND responseCode IN(68,30)
	  AND e.issuerChannelId='mip1'



SET @lastEchoTestMip2=(SELECT lastUpdated FROM [transfer].[networkStatus] WHERE networkStatusId='echotsMip2')
SET @lastSignOnMip2=(SELECT lastUpdated FROM [transfer].[networkStatus] WHERE networkStatusId='signonMip2')
SET @lastSignOffMip2=(SELECT lastUpdated FROM [transfer].[networkStatus] WHERE networkStatusId='signofMip2')
SELECT @countTimeOutMip2= sum(CASE WHEN responseCode=68 THEN 1 ELSE 0 END)
	  ,@countFormatErrorMip2 = sum(CASE WHEN responseCode=30 THEN 1 ELSE 0 END)
	  FROM 
	  [transfer].eventFailed e
	  WHERE e.eventDateTime BETWEEN  @dateFrom AND @dateTo
	  AND responseCode IN(68,30)
	  AND e.issuerChannelId='mip2'

SET @dateFrom=DATEADD(MINUTE,-@settingPeriod,@dateTo)
 
 SELECT 'monitoring' resultSetName
 SELECT @lastEchoTestMip1 lastEchoTest,@lastSignOnMip1 lastSignOn,@lastSignOffMip1 lastSignOff,@countTimeOutMip1 countTimeOut,@lastSignOffMip1 LastSignOff, 'mip1' mip
UNION
 SELECT @lastEchoTestMip2 lastEchoTest,@lastSignOnMip2 lastSignOn,@lastSignOffMip2 lastSignOff,@countTimeOutMip2 countTimeOut,@lastSignOffMip2 LastSignOff, 'mip2' mip

SELECT 'color' resultSetName
 SELECT CASE WHEN @settingErrorNumber<@countTimeOutMip1 THEN 1 ELSE 0 END isAmberMip1, CASE WHEN @settingErrorNumber<@countTimeOutMip2 THEN 1 ELSE 0 END isAmberMip2 
