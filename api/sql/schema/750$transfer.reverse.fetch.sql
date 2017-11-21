ALTER PROCEDURE [transfer].[reverse.fetch] -- this SP gets all existing card Product in DB or selected by binId or bin
    @transferId BIGINT
   
AS
    

    SELECT 'reverse' AS resultSetName

    SELECT
    r.transferId reverseTransferId
    ,r.reverseAmount
    ,r.isPartial
    ,r.issuerResponseCode
    ,r.issuerResponseMessage
    ,transferDateTime reversedDate
    FROM [transfer].[reverse] r
    WHERE r.transferId=@transferId
     