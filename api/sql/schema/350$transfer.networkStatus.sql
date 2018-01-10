CREATE TABLE [transfer].[networkStatus](
	[networkStatusId] char(10) NOT NULL,
	[lastUpdated] datetime2(0) NOT NULL,
	[description] varchar(250) NULL,
 CONSTRAINT [pkТransferNetworkStatusId] PRIMARY KEY CLUSTERED( [networkStatusId] ASC ) 
 )  