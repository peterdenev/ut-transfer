DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [TINYINT] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation) VALUES ('transferManagement', 'Manage Transactions', 'Manage Transactions')

EXEC core.[itemNameTranslation.upload]
    @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId,
    @organizationId = NULL,
    @itemType = 'roleCategory',
    @meta = @meta

DECLARE @transferManagementId BIGINT = (
    SELECT itemNameId
    FROM [core].[itemName] i
    JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId
    WHERE it.[name] = 'roleCategory' AND itemCode = 'transferManagement')

DECLARE @transactionCreate BIGINT, @transactionReverse BIGINT, @transactionReject BIGINT, @transactionCancel BIGINT, @transactionReport BIGINT

--Transactions
--Create transactions
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Create Transactions')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @transactionCreate = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@transactionCreate, 'Create Transactions', 'Create Transactions', 1, 0, @transferManagementId, 1)
END
ELSE
    SET @transactionCreate = (SELECT actorId FROM [user].[role] WHERE name = 'Create Transactions')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@transactionCreate, 'transfer.pendingUserTransfers.fetch', '%', 1),
        (@transactionCreate, 'transfer.transfer.get', '%', 1),
        (@transactionCreate, 'transfer.transferDetails.get', '%', 1),
        (@transactionCreate, 'transfer.push.create', '%', 1),
        (@transactionCreate, 'transfer.push.approve', '%', 1),
        (@transactionCreate, 'transaction.pendingUserTransfers.fetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

--Reverse transactions
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Reverse Transactions')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @transactionReverse = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@transactionReverse, 'Reverse Transactions', 'Reverse Transactions', 1, 0, @transferManagementId, 1)
END
ELSE
    SET @transactionReverse = (SELECT actorId FROM [user].[role] WHERE name = 'Reverse Transactions')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@transactionReverse, 'transfer.pendingUserTransfers.fetch', '%', 1),
        (@transactionReverse, 'transfer.transfer.get', '%', 1),
        (@transactionReverse, 'transfer.transferDetails.get', '%', 1),
        (@transactionReverse, 'transfer.push.reverse', '%', 1),
        (@transactionReverse, 'transaction.pendingUserTransfers.fetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

--Reject transactions
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Reject Transactions')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @transactionReject = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@transactionReject, 'Reject Transactions', 'Reject Transactions', 1, 0, @transferManagementId, 1)
END
ELSE
    SET @transactionReject = (SELECT actorId FROM [user].[role] WHERE name = 'Reject Transactions')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@transactionReject, 'transfer.pendingUserTransfers.fetch', '%', 1),
        (@transactionReject, 'transfer.transfer.get', '%', 1),
        (@transactionReject, 'transfer.transferDetails.get', '%', 1),
        (@transactionReject, 'transfer.pending.reject', '%', 1),
        (@transactionReject, 'transfer.push.reject', '%', 1),
        (@transactionReject, 'transaction.pendingUserTransfers.fetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

--Cancel transactions
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Cancel Transactions')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @transactionCancel = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@transactionCancel, 'Cancel Transactions', 'Cancel Transactions', 1, 0, @transferManagementId, 1)
END
ELSE
    SET @transactionCancel = (SELECT actorId FROM [user].[role] WHERE name = 'Cancel Transactions')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@transactionCancel, 'transfer.pendingUserTransfers.fetch', '%', 1),
        (@transactionCancel, 'transfer.transfer.get', '%', 1),
        (@transactionCancel, 'transfer.transferDetails.get', '%', 1),
        (@transactionCancel, 'transfer.pending.cancel', '%', 1),
        (@transactionCancel, 'transfer.push.cancel', '%', 1),
        (@transactionCancel, 'transaction.pendingUserTransfers.fetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

--Extract transaction reports
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Extract transaction reports')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @transactionReport = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@transactionReport, 'Extract transaction reports', 'Extract transaction reports', 1, 0, @transferManagementId, 1)
END
ELSE
    SET @transactionReport = (SELECT actorId FROM [user].[role] WHERE name = 'Extract transaction reports')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@transactionReport, 'transfer.report.byDayOfWeek', '%', 1),
        (@transactionReport, 'transfer.report.byHourOfDay', '%', 1),
        (@transactionReport, 'transfer.report.byTypeOfTransfer', '%', 1),
        (@transactionReport, 'transfer.report.byWeekOfYear', '%', 1),
        (@transactionReport, 'transfer.report.settlement', '%', 1),
        (@transactionReport, 'transfer.report.settlementDetails', '%', 1),
        (@transactionReport, 'transfer.report.transfer', '%', 1),
        (@transactionReport, 'transaction.pendingUserTransfers.fetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);
