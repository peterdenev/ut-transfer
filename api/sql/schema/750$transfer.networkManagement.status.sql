ALTER PROCEDURE [transfer].[networkManagement.status]    
AS
DECLARE @settingPeriod INT=(SELECT [value] FROM [transfer].networkManagementSetting WHERE networkManagementSettingId='T' )
DECLARE @settingErrorNumber INT=(SELECT [value] FROM [transfer].networkManagementSetting WHERE networkManagementSettingId='E' )
DECLARE @dateFrom datetime2(0)
DECLARE @dateTo datetime2(0)=GETDATE()
DECLARE @lastEchoTest datetime2(0)
DECLARE @lastSignOn datetime2(0)
DECLARE @lastSignOff datetime2(0)
DECLARE @countTimeOut int
DECLARE @countFormatError int

SET @lastEchoTest=(SELECT lastUpdated FROM [transfer].[networkStatus] WHERE networkStatusId='echots')
SET @lastSignOn=(SELECT lastUpdated FROM [transfer].[networkStatus] WHERE networkStatusId='signon')
SET @lastSignOff=(SELECT lastUpdated FROM [transfer].[networkStatus] WHERE networkStatusId='signof')
SELECT @countTimeOut= sum(CASE WHEN responseCode=68 THEN 1 ELSE 0 END)
	  ,@countFormatError = sum(CASE WHEN responseCode=30 THEN 1 ELSE 0 END)
	  FROM 
	  [transfer].eventFailed e
	  WHERE e.eventDateTime BETWEEN  @dateFrom AND @dateTo
	  AND responseCode IN(68,30)

SET @dateFrom=DATEADD(MINUTE,-@settingPeriod,@dateTo)
 
 SELECT 'monitoring' resultSetName
 SELECT @lastEchoTest lastEchoTest,@lastSignOn lastSignOn,@lastSignOff lastSignOff,@countTimeOut countTimeOut,@lastSignOff LastSignOff

SELECT 'color' resultSetName
 SELECT CASE WHEN @settingErrorNumber<@countTimeOut THEN 1 ELSE 0 END isAmber
