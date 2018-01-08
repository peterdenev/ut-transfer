ALTER PROCEDURE [transfer].[networkManagementConfig.update]
 @period INT,
 @errorNumber INT
 AS
UPDATE n SET [value]=@period 
FROM [transfer].networkManagementSetting n 
WHERE networkManagementSettingId='T' 

UPDATE n SET [value]=@errorNumber 
FROM [transfer].networkManagementSetting n 
WHERE networkManagementSettingId='E' 