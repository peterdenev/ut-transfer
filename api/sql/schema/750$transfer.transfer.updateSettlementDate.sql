ALTER PROCEDURE [transfer].[transfer.updateSettlementDate]
    
    @settlementDate DATE
AS
DECLARE @dateFrom DATE,
        @dateTo DATE
BEGIN TRY
    SET @dateFrom=@settlementDate
    SET @dateTo=DATEADD(day,1,@settlementDate)
    UPDATE t SET settlementDate=@settlementDate
    FROM[transfer].[transfer] t
    WHERE( @dateFrom IS NULL OR t.transferDateTime >= @dateFrom  ) AND ( @dateTo IS NULL OR t.transferDateTime < @dateTo )
 
 END TRY
BEGIN CATCH
    EXEC [core].[error]
    RETURN 55555
END CATCH