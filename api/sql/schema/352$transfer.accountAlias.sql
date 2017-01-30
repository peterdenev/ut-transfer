CREATE TABLE [transfer].[accountAlias](
    id INT IDENTITY(1,1) NOT NULL,
	code VARCHAR(50) NOT NULL,
	[type] VARCHAR(50) NOT NULL,
	[value] VARCHAR(50) NOT NULL,
    isSystem BIT NOT NULL DEFAULT (0),
    isActive BIT NOT NULL DEFAULT(1),
    createdBy BIGINT NOT NULL,
    createdOn DATETIME2 NOT NULL,
    updatedBy BIGINT NULL,
    updatedOn DATETIME2 NULL,
CONSTRAINT pk_accountAlias PRIMARY KEY CLUSTERED (id),
CONSTRAINT uk_accountAlias_code UNIQUE(Code),
CONSTRAINT [fkAccountAlias_typeAlias] FOREIGN KEY([type]) REFERENCES [transfer].typeAlias([type])
) 