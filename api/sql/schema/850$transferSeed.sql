DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT

DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');
 
DECLARE @itemNameId bigint, @itemTypeId int 
DECLARE @parentItemNameId bigint

/*clearingStatus*/
 IF NOT EXISTS(select top 1 1 from [transfer].[clearingStatus])
 BEGIN
 INSERT INTO [transfer].[clearingStatus]
 VALUES('pendi','pending' ),
 ('forcl','for clearing' ),
 ('clred','cleared' )
 END
  
  
/*issuerTxState*/
 IF NOT EXISTS(select top 1 1 from [transfer].[issuerTxState])
 BEGIN
 INSERT INTO [transfer].[issuerTxState]
 VALUES('rsent','Request was sent' ),
    ('rconf','Request was confirmed' ),
    ('rdeni','Request was denied' ),
    ('rteue','Request timed out or ended with unknown error' ),
    ('rabrr','Request was aborted before any response was received' ),
    ('unerc','Unexpected error condition' ),
    ('streq','Store was requested' ),
    ('stcon','Store was confirmed' ),
    ('clred','Store timed out or returned unknown error' ),
    ('forre','Forward was requested' ),
    ('forco','Forward was confirmed' ),
    ('forde','Forward was denied' ),
    ('ftrue','Forward timed out or returned unknown error' )


 
 END
  