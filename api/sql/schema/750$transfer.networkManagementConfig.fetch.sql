ALTER PROCEDURE [transfer].[networkManagementConfig.fetch]    
AS
 SELECT 'networkManagementConfig' resultSetName
 SELECT * FROM [transfer].networkManagementSetting 
 