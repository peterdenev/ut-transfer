ALTER PROCEDURE [transfer].[transfer.updateSettlementDate]
    @transfersId [core].[arrayNumberList] READONLY,
    @settlementDate DATE
AS
BEGIN TRY
    UPDATE  t SET settlementDate=@settlementDate 
    FROM[transfer].[transfer] t
    JOIN @transfersId ti on t.transferId=ti.value 
 END TRY
BEGIN CATCH
    EXEC [core].[error]
    RETURN 55555
END CATCH
