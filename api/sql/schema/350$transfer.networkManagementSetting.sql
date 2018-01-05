CREATE TABLE [transfer].[networkManagementSetting](
    networkManagementSettingId CHAR(1) NOT NULL,
   [value] INT NOT NULL,
    CONSTRAINT [pkТransferNetworkManagementSetting] PRIMARY KEY CLUSTERED (networkManagementSettingId ASC)
)