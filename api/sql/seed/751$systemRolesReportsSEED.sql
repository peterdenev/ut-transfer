DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT
DECLARE @enLanguageId [TINYINT] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');

INSERT INTO @itemNameTranslationTT(itemCode, itemName, itemNameTranslation)
VALUES ('report', 'Manage Reports', 'Manage Reports')

EXEC core.[itemNameTranslation.upload]
    @itemNameTranslationTT = @itemNameTranslationTT,
    @languageId = @enLanguageId,
    @organizationId = NULL,
    @itemType = 'roleCategory', @meta = @meta

DECLARE @reportId BIGINT = (
    SELECT itemNameId
    FROM [core].[itemName] i
    JOIN [core].[itemType] it ON i.itemTypeId = it.itemTypeId
    WHERE it.[name] = 'roleCategory' AND itemCode = 'report')

DECLARE @reportTransaction BIGINT, @reportTransactionStat BIGINT, @reportTransactionHour BIGINT, @reportTransactionWeek BIGINT
DECLARE @reportTransactionYear BIGINT, @reportSettle BIGINT, @reportSettleDetails BIGINT

--Transaction reports
--Transaction Report
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Transaction List')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @reportTransaction = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@reportTransaction, 'Transaction List', 'Transaction List', 1, 0, @reportId, 1)
END
ELSE
    SET @reportTransaction = (SELECT actorId FROM [user].[role] WHERE name = 'Transaction List')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@reportTransaction, 'report.report.nav', '%', 1),
        (@reportTransaction, 'report.transfer.nav', '%', 1),
        (@reportTransaction, 'db/transfer.report.transfer', '%', 1),
        (@reportTransaction, 'core.itemName.fetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

-- Transaction Type Statistics
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Transaction Type Statistics')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @reportTransactionStat = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@reportTransactionStat, 'Transaction Type Statistics', 'Transaction Type Statistics', 1, 0, @reportId, 1)
END
ELSE
    SET @reportTransactionStat = (SELECT actorId FROM [user].[role] WHERE name = 'Transaction Type Statistics')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@reportTransactionStat, 'report.report.nav', '%', 1),
        (@reportTransactionStat, 'report.transfer.nav', '%', 1),
        (@reportTransactionStat, 'db/transfer.report.byTypeOfTransfer', '%', 1),
        (@reportTransactionStat, 'core.itemCode.fetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

-- Hour of Day Statistics
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Transaction - Hour of Day Statistics')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @reportTransactionHour = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@reportTransactionHour, 'Transaction - Hour of Day Statistics', 'Transaction - Hour of Day Statistics', 1, 0, @reportId, 1)
END
ELSE
    SET @reportTransactionHour = (SELECT actorId FROM [user].[role] WHERE name = 'Transaction - Hour of Day Statistics')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@reportTransactionHour, 'report.report.nav', '%', 1),
        (@reportTransactionHour, 'report.transfer.nav', '%', 1),
        (@reportTransactionHour, 'db/transfer.report.byHourOfDay', '%', 1),
        (@reportTransactionHour, 'core.itemCode.fetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

-- Day of Week Statistics
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Transaction - Day of Week Statistics')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @reportTransactionWeek = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@reportTransactionWeek, 'Transaction - Day of Week Statistics', 'Transaction - Day of Week Statistics', 1, 0, @reportId, 1)
END
ELSE
    SET @reportTransactionWeek = (SELECT actorId FROM [user].[role] WHERE name = 'Transaction - Day of Week Statistics')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@reportTransactionWeek, 'report.report.nav', '%', 1),
        (@reportTransactionWeek, 'report.transfer.nav', '%', 1),
        (@reportTransactionWeek, 'db/transfer.report.byDayOfWeek', '%', 1),
        (@reportTransactionWeek, 'core.itemCode.fetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

-- Transaction - Week of Year Statistics
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Transaction - Week of Year Statistics')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @reportTransactionYear = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@reportTransactionYear, 'Transaction - Week of Year Statistics', 'Transaction - Week of Year Statistics', 1, 0, @reportId, 1)
END
ELSE
    SET @reportTransactionYear = (SELECT actorId FROM [user].[role] WHERE name = 'Transaction - Week of Year Statistics')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@reportTransactionYear, 'report.report.nav', '%', 1),
        (@reportTransactionYear, 'report.transfer.nav', '%', 1),
        (@reportTransactionYear, 'db/transfer.report.byWeekofYear', '%', 1),
        (@reportTransactionYear, 'core.itemCode.fetch', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

-- Settlement Report
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Transaction - Settlement Report')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @reportSettle = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@reportSettle, 'Transaction - Settlement Report', 'Transaction - Settlement Report', 1, 0, @reportId, 1)
END
ELSE
    SET @reportSettle = (SELECT actorId FROM [user].[role] WHERE name = 'Transaction - Settlement Report')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@reportSettle, 'report.report.nav', '%', 1),
        (@reportSettle, 'report.transfer.nav', '%', 1),
        (@reportSettle, 'db/transfer.report.settlement', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);

-- Settlement Details
IF NOT EXISTS(SELECT * FROM [user].[role] WHERE name = 'Transaction - Settlement Details')
BEGIN
    INSERT INTO core.actor(actorType, isEnabled) VALUES('role', 1)
    SET @reportSettleDetails = SCOPE_IDENTITY()
    INSERT INTO [user].[role](actorId, name, [description], isEnabled, isDeleted, fieldOfWorkId, isSystem)
    VALUES(@reportSettleDetails, 'Transaction - Settlement Details', 'Transaction - Settlement Details', 1, 0, @reportId, 1)
END
ELSE
    SET @reportSettleDetails = (SELECT actorId FROM [user].[role] WHERE name = 'Transaction - Settlement Details')

MERGE INTO [user].actorAction AS target
USING
    (VALUES
        (@reportSettleDetails, 'report.report.nav', '%', 1),
        (@reportSettleDetails, 'report.transfer.nav', '%', 1),
        (@reportSettleDetails, 'db/transfer.report.settlementDetails', '%', 1)
    ) AS source (actorId, actionId, objectId, [level])
ON target.actorId = source.actorId AND target.actionId = source.actionId AND target.objectId = source.objectId AND target.[level] = source.[level]
WHEN NOT MATCHED BY TARGET THEN
    INSERT (actorId, actionId, objectId, [level])
    VALUES (actorId, actionId, objectId, [level]);
