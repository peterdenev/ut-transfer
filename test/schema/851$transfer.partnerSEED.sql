DECLARE @systemCbs BIGINT = (SELECT MIN(actorId) FROM [transfer].[partner] WHERE partnerId = N'cbs')
DECLARE @systemAcquirer BIGINT = (SELECT MIN(actorId) FROM [transfer].[partner] WHERE partnerId = N'acquirer')

IF @systemCbs IS NULL
BEGIN
    INSERT
        [core].[actor](actorType, isEnabled)
    VALUES
        (N'system', 1)

    SET @systemCbs = SCOPE_IDENTITY()

    INSERT
        [transfer].[partner] (actorId, partnerId, [name], port, mode, settlementDate, serialNumber, settings)
    VALUES
        (@systemCbs, N'cbs', N'T24', N't24/transfer', N'online', N'2017-01-16 10:30:07.777', 3, NULL)
END

IF @systemAcquirer IS NULL
BEGIN
    INSERT
        [core].[actor](actorType, isEnabled)
    VALUES
        (N'system', 1)

    SET @systemAcquirer = SCOPE_IDENTITY()

    INSERT
        [transfer].[partner] (actorId, partnerId, [name], port, mode, settlementDate, serialNumber, settings)
    VALUES
        (@systemAcquirer, N'acquirer', N'acquirer', N'acquirer/transfer', N'online', N'2017-01-16 10:30:35.207', 187, NULL)
END
