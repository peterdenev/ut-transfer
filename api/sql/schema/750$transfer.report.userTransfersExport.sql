ALTER PROCEDURE [transfer].[report.userTransfersExport]
    @startDate DATETIME2(0), -- transaction start date
    @endDate DATETIME2(0), -- transaction end date
    @customerNumber NVARCHAR(20), -- filter by customer number
    @meta core.metaDataTT READONLY -- information for the user that makes the operation
AS
    -- checks if the user has a right to make the operation
    DECLARE @actionID VARCHAR(100) = OBJECT_SCHEMA_NAME(@@PROCID) + '.' + OBJECT_NAME(@@PROCID), @RETURN INT = 0
    EXEC @RETURN = [user].[permission.check] @actionId = @actionID, @objectId = NULL, @meta = @meta
    IF @RETURN != 0
    BEGIN
        RETURN 55555
    END

    IF @endDate IS NULL
    BEGIN
        SET @endDate = DATEADD(day, DATEDIFF(day, 0, GETDATE()), 1)
        IF @startDate IS NULL
            SET @startDate = DATEADD(day, DATEDIFF(day, 0, @endDate), -1)
    END

    SELECT 'transfers' AS resultSetName
    SELECT
        c.actorId,
        c.personName AS senderName,
        c.customerNumber,
        c.userName,
        t.sourceAccount AS senderAccount,
        t.destinationAccount AS beneficiaryAccount,
        t.transferDateTime,
        t.transferAmount,
        t.transferCurrency,
        t.[description]
    FROM [integration].[vCustomer] c
    JOIN [transfer].[transfer] t ON t.channelId = c.actorId
    WHERE transferDateTime >= @startDate
        AND transferDateTime < @endDate
        AND (@customerNumber IS NULL OR c.customerNumber = @customerNumber)



