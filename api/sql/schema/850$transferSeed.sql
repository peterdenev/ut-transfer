DECLARE @itemNameTranslationTT core.itemNameTranslationTT
DECLARE @meta core.metaDataTT

DECLARE @enLanguageId [tinyint] = (SELECT languageId FROM [core].[language] WHERE iso2Code = 'en');
 
DECLARE @itemNameId bigint, @itemTypeId int 
DECLARE @parentItemNameId bigint

/*clearingStatus*/
 IF NOT EXISTS(select top 1 1 from [transfer].[clearingStatus])
 BEGIN
 INSERT INTO [transfer].[clearingStatus]
 VALUES('pendng','Pending' ),
 ('forclr','For Clearing' ),
 ('sentcl','Sent For Clearing' ),
 ('cleard','Cleared' )
 END
  
  
/*issuerTxState*/
 IF NOT EXISTS(select top 1 1 from [transfer].[issuerTxState])
 BEGIN
 INSERT INTO [transfer].[issuerTxState]
 VALUES(1,'Request was sent' ),
    (2,'Request was confirmed' ),
    (3,'Request was denied' ),
    (4,'Request timed out or ended with unknown error' ),
    (5,'Request was aborted before any response was received' ),
    (6,'Unexpected error condition' ),
    (7,'Store was requested' ),
    (8,'Store was confirmed' ),
    (9,'Store timed out or returned unknown error' ),
    (11,'Forward was requested' ),
    (12,'Forward was confirmed' ),
    (13,'Forward was denied' ),
    (14,'Forward timed out or returned unknown error' )
 END
  
/*requestSource*/
 IF NOT EXISTS(select top 1 1 from [transfer].[requestSource])
 BEGIN
 INSERT INTO [transfer].[requestSource]
 VALUES('aquire','Aquirer' ),
 ('switch','SG Switch' ),
 ('issuer','Issuer' )
 END

 /*issuerChannel*/
 IF NOT EXISTS(select top 1 1 from [transfer].[issuerChannel])
 BEGIN
 INSERT INTO [transfer].[issuerChannel]
 VALUES('mip1','MIP 1' ),
 ('mip2','MIP 2' )
 END