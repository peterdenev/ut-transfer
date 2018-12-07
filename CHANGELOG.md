<a name="6.27.1"></a>
## [6.27.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.27.0...v6.27.1) (2018-12-07)


### Bug Fixes

* copy view code from major/rc-dss ([#193](https://github.com/softwaregroup-bg/ut-transfer/issues/193)) ([80efd24](https://github.com/softwaregroup-bg/ut-transfer/commit/80efd24))



<a name="6.27.0"></a>
# [6.27.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.26.1...v6.27.0) (2018-08-23)


### Bug Fixes

* add accountTypeId in result set ([1a19164](https://github.com/softwaregroup-bg/ut-transfer/commit/1a19164))
* add payee table and stored procedures for add and edit ([9f760b8](https://github.com/softwaregroup-bg/ut-transfer/commit/9f760b8))
* get userId from [@meta](https://github.com/meta) ([db44630](https://github.com/softwaregroup-bg/ut-transfer/commit/db44630))
* get userId from TT table if is null get from meta ([ea666d8](https://github.com/softwaregroup-bg/ut-transfer/commit/ea666d8))
* remove transactions ([7829bfd](https://github.com/softwaregroup-bg/ut-transfer/commit/7829bfd))
* update procedure for get payee with left join to table itemTranslation ([1886efc](https://github.com/softwaregroup-bg/ut-transfer/commit/1886efc))
* update procedure payee.list and add condition isDeleted = 0 ([fdec021](https://github.com/softwaregroup-bg/ut-transfer/commit/fdec021))


### Features

* add procedures for add, edit, fetch, get, delete payees ([0f4bd7a](https://github.com/softwaregroup-bg/ut-transfer/commit/0f4bd7a))
* payee joi validations ([46e6cce](https://github.com/softwaregroup-bg/ut-transfer/commit/46e6cce))



<a name="6.26.1"></a>
## [6.26.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.26.0...v6.26.1) (2018-08-23)


### Bug Fixes

* improve reversals, pass data to confirm reversal procedures ([e582f64](https://github.com/softwaregroup-bg/ut-transfer/commit/e582f64))



<a name="6.26.0"></a>
# [6.26.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.26.0-rc-einstein.0...v6.26.0) (2018-08-02)



<a name="6.25.0"></a>
# [6.25.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.25.0-rc-diesel.5...v6.25.0) (2018-06-07)



<a name="6.24.1"></a>
## [6.24.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.24.0...v6.24.1) (2018-04-27)


### Bug Fixes

* check fallback ([f8efe69](https://github.com/softwaregroup-bg/ut-transfer/commit/f8efe69))



<a name="6.24.0"></a>
# [6.24.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.23.1...v6.24.0) (2018-04-18)


### Bug Fixes

* ACCU-2651 add inactive account error ([462c583](https://github.com/softwaregroup-bg/ut-transfer/commit/462c583))
* added issuer requested utc date time ([#164](https://github.com/softwaregroup-bg/ut-transfer/issues/164)) ([7e72ec4](https://github.com/softwaregroup-bg/ut-transfer/commit/7e72ec4))
* added reversedLedger to vTransferEvent ([#161](https://github.com/softwaregroup-bg/ut-transfer/issues/161)) ([9fe6c59](https://github.com/softwaregroup-bg/ut-transfer/commit/9fe6c59))
* build ([bc40a3a](https://github.com/softwaregroup-bg/ut-transfer/commit/bc40a3a))
* fix joi to be peer dependency ([#166](https://github.com/softwaregroup-bg/ut-transfer/issues/166)) ([261e0f0](https://github.com/softwaregroup-bg/ut-transfer/commit/261e0f0))
* handle inactive account error ([e6c7b40](https://github.com/softwaregroup-bg/ut-transfer/commit/e6c7b40))
* remove ut-report dependency ([0558796](https://github.com/softwaregroup-bg/ut-transfer/commit/0558796))
* report filtering ([41f38a4](https://github.com/softwaregroup-bg/ut-transfer/commit/41f38a4))
* select auth code in idle.execute ([#156](https://github.com/softwaregroup-bg/ut-transfer/issues/156)) ([3b8dcf0](https://github.com/softwaregroup-bg/ut-transfer/commit/3b8dcf0))
* transfer report modification ([#160](https://github.com/softwaregroup-bg/ut-transfer/issues/160)) ([38a9332](https://github.com/softwaregroup-bg/ut-transfer/commit/38a9332))
* update auth code, money precision ([#168](https://github.com/softwaregroup-bg/ut-transfer/issues/168)) ([bfa751c](https://github.com/softwaregroup-bg/ut-transfer/commit/bfa751c))



<a name="6.23.1"></a>
## [6.23.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.23.0...v6.23.1) (2018-03-05)



<a name="6.23.0"></a>
# [6.23.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.23.0-rc-bahur.31...v6.23.0) (2018-03-02)



<a name="6.22.0"></a>
# [6.22.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.21.0-rc-acapulco.35...v6.22.0) (2017-12-15)



<a name="6.21.0"></a>
# [6.21.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.21.0-rc-acapulco.32...v6.21.0) (2017-12-14)



<a name="6.21.0"></a>
# [6.21.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.21.0-rc-acapulco.32...v6.21.0) (2017-12-14)



<a name="6.20.0"></a>
# [6.20.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.19.1...v6.20.0) (2017-10-25)


### Bug Fixes

* filter default values ([#82](https://github.com/softwaregroup-bg/ut-transfer/issues/82)) ([948aeda](https://github.com/softwaregroup-bg/ut-transfer/commit/948aeda))
* handle race conditions ([97745e5](https://github.com/softwaregroup-bg/ut-transfer/commit/97745e5))
* timeout handling ([1ba9a18](https://github.com/softwaregroup-bg/ut-transfer/commit/1ba9a18))


### Features

* card product improvements ([#85](https://github.com/softwaregroup-bg/ut-transfer/issues/85)) ([92fa02f](https://github.com/softwaregroup-bg/ut-transfer/commit/92fa02f))



<a name="6.19.1"></a>
## [6.19.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.19.0...v6.19.1) (2017-08-04)


### Bug Fixes

* upgrade ut-front-react? ([#81](https://github.com/softwaregroup-bg/ut-transfer/issues/81)) ([9861739](https://github.com/softwaregroup-bg/ut-transfer/commit/9861739))



<a name="6.19.0"></a>
# [6.19.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.18.1...v6.19.0) (2017-08-04)


### Features

* upgrade react ([62e90be](https://github.com/softwaregroup-bg/ut-transfer/commit/62e90be))



<a name="6.18.1"></a>
## [6.18.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.18.0...v6.18.1) (2017-08-04)



<a name="6.18.0"></a>
# [6.18.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.17.4...v6.18.0) (2017-08-03)



<a name="6.17.4"></a>
## [6.17.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.17.3...v6.17.4) (2017-08-02)


### Bug Fixes

* check all items on grid, UIS-3173 ([#78](https://github.com/softwaregroup-bg/ut-transfer/issues/78)) ([3e32b12](https://github.com/softwaregroup-bg/ut-transfer/commit/3e32b12))



<a name="6.17.3"></a>
## [6.17.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.17.2...v6.17.3) (2017-07-31)


### Bug Fixes

* vTransfer to include 'web' channel type ([#77](https://github.com/softwaregroup-bg/ut-transfer/issues/77)) ([5c6f878](https://github.com/softwaregroup-bg/ut-transfer/commit/5c6f878))



<a name="6.17.2"></a>
## [6.17.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.17.1...v6.17.2) (2017-07-28)


### Bug Fixes

* remove extra space ([#76](https://github.com/softwaregroup-bg/ut-transfer/issues/76)) ([24d0054](https://github.com/softwaregroup-bg/ut-transfer/commit/24d0054))



<a name="6.17.1"></a>
## [6.17.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.17.0...v6.17.1) (2017-07-24)


### Bug Fixes

* header button type to make it highlighted ([#73](https://github.com/softwaregroup-bg/ut-transfer/issues/73)) ([dcb0a94](https://github.com/softwaregroup-bg/ut-transfer/commit/dcb0a94))



<a name="6.17.0"></a>
# [6.17.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.16.0...v6.17.0) (2017-07-24)


### Features

* web channel ([#70](https://github.com/softwaregroup-bg/ut-transfer/issues/70)) ([2f33907](https://github.com/softwaregroup-bg/ut-transfer/commit/2f33907))



<a name="6.16.0"></a>
# [6.16.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.15.7...v6.16.0) (2017-07-24)


### Features

* teller initiated audit ([ec77da3](https://github.com/softwaregroup-bg/ut-transfer/commit/ec77da3))



<a name="6.15.8"></a>
## [6.15.8](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.15.7...v6.15.8) (2017-07-20)


### Features

* tia ([aa0f3b8](https://github.com/softwaregroup-bg/ut-transfer/commit/aa0f3b8))



<a name="6.15.7"></a>
## [6.15.7](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.15.6...v6.15.7) (2017-07-12)


### Bug Fixes

* update tests ([6bf9009](https://github.com/softwaregroup-bg/ut-transfer/commit/6bf9009))



<a name="6.15.6"></a>
## [6.15.6](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.15.5...v6.15.6) (2017-07-11)



<a name="6.15.5"></a>
## [6.15.5](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.15.4...v6.15.5) (2017-07-07)


### Bug Fixes

* paging issues ([7ae967c](https://github.com/softwaregroup-bg/ut-transfer/commit/7ae967c))



<a name="6.15.4"></a>
## [6.15.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.15.3...v6.15.4) (2017-07-06)



<a name="6.15.3"></a>
## [6.15.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.15.2...v6.15.3) (2017-07-06)



<a name="6.15.2"></a>
## [6.15.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.15.1...v6.15.2) (2017-07-05)


### Bug Fixes

* disable edit btn when no changes are made and improve serial number validation ([c1e69d4](https://github.com/softwaregroup-bg/ut-transfer/commit/c1e69d4))



<a name="6.15.1"></a>
## [6.15.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.15.0...v6.15.1) (2017-06-29)


### Bug Fixes

* pass metadata ([b829c71](https://github.com/softwaregroup-bg/ut-transfer/commit/b829c71))



<a name="6.15.0"></a>
# [6.15.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.14.2...v6.15.0) (2017-06-22)


### Features

* partner front-end ([ba79fa4](https://github.com/softwaregroup-bg/ut-transfer/commit/ba79fa4))



<a name="6.14.2"></a>
## [6.14.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.14.1...v6.14.2) (2017-06-21)


### Bug Fixes

* pass $meta ([bcbc8c3](https://github.com/softwaregroup-bg/ut-transfer/commit/bcbc8c3))



<a name="6.14.1"></a>
## [6.14.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.14.0...v6.14.1) (2017-06-12)


### Bug Fixes

* vb1 ([8f035de](https://github.com/softwaregroup-bg/ut-transfer/commit/8f035de))



<a name="6.14.0"></a>
# [6.14.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.13.6...v6.14.0) (2017-06-09)


### Features

* pending transactions and permissions ([#59](https://github.com/softwaregroup-bg/ut-transfer/issues/59)) ([4a7b4ce](https://github.com/softwaregroup-bg/ut-transfer/commit/4a7b4ce))



<a name="6.13.6"></a>
## [6.13.6](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.13.5...v6.13.6) (2017-06-07)


### Bug Fixes

* handle ledger reversals ([2bdfc10](https://github.com/softwaregroup-bg/ut-transfer/commit/2bdfc10))



<a name="6.13.5"></a>
## [6.13.5](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.13.4...v6.13.5) (2017-05-31)


### Bug Fixes

* encrypt card number ([4202012](https://github.com/softwaregroup-bg/ut-transfer/commit/4202012))



<a name="6.13.4"></a>
## [6.13.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.13.3...v6.13.4) (2017-05-31)


### Bug Fixes

* add search btn ([#56](https://github.com/softwaregroup-bg/ut-transfer/issues/56)) ([824414c](https://github.com/softwaregroup-bg/ut-transfer/commit/824414c))
* removed abortAcquirer error circular refs ([e278537](https://github.com/softwaregroup-bg/ut-transfer/commit/e278537))



<a name="6.13.3"></a>
## [6.13.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.13.2...v6.13.3) (2017-05-31)


### Bug Fixes

* transfer.partner.fetch result validation ([#58](https://github.com/softwaregroup-bg/ut-transfer/issues/58)) ([5ee0f58](https://github.com/softwaregroup-bg/ut-transfer/commit/5ee0f58))



<a name="6.13.2"></a>
## [6.13.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.13.1...v6.13.2) (2017-05-29)


### Bug Fixes

* get card product name ([#54](https://github.com/softwaregroup-bg/ut-transfer/issues/54)) ([26ba2c9](https://github.com/softwaregroup-bg/ut-transfer/commit/26ba2c9))



<a name="6.13.1"></a>
## [6.13.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.13.0...v6.13.1) (2017-05-26)


### Bug Fixes

* return detail in error([#53](https://github.com/softwaregroup-bg/ut-transfer/issues/53)) ([8d28bd9](https://github.com/softwaregroup-bg/ut-transfer/commit/8d28bd9))



<a name="6.13.0"></a>
# [6.13.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.12.6...v6.13.0) (2017-05-26)


### Features

* remove bulk payments ([23a198d](https://github.com/softwaregroup-bg/ut-transfer/commit/23a198d))



<a name="6.12.6"></a>
## [6.12.6](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.12.5...v6.12.6) (2017-05-26)


### Bug Fixes

* don't reverse if no pending reversal([#52](https://github.com/softwaregroup-bg/ut-transfer/issues/52)) ([dceed54](https://github.com/softwaregroup-bg/ut-transfer/commit/dceed54))



<a name="6.12.5"></a>
## [6.12.5](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.12.4...v6.12.5) (2017-05-22)



<a name="6.12.4"></a>
## [6.12.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.12.3...v6.12.4) (2017-05-22)



<a name="6.12.3"></a>
## [6.12.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.12.2...v6.12.3) (2017-05-22)



<a name="6.12.2"></a>
## [6.12.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.12.1...v6.12.2) (2017-05-22)



<a name="6.12.1"></a>
## [6.12.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.12.0...v6.12.1) (2017-05-22)



<a name="6.12.0"></a>
# [6.12.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.11.6...v6.12.0) (2017-05-19)


### Features

* improve reversals ([39d80b3](https://github.com/softwaregroup-bg/ut-transfer/commit/39d80b3))



<a name="6.11.6"></a>
## [6.11.6](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.11.5...v6.11.6) (2017-05-19)



<a name="6.11.5"></a>
## [6.11.5](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.11.4...v6.11.5) (2017-05-18)


### Bug Fixes

* amount to cents handling ([a60b208](https://github.com/softwaregroup-bg/ut-transfer/commit/a60b208))



<a name="6.11.4"></a>
## [6.11.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.11.3...v6.11.4) (2017-05-17)


### Bug Fixes

* modularise styles handling ([f2214fc](https://github.com/softwaregroup-bg/ut-transfer/commit/f2214fc))



<a name="6.11.3"></a>
## [6.11.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.11.2...v6.11.3) (2017-05-17)


### Bug Fixes

* use correct state name ([ac78f86](https://github.com/softwaregroup-bg/ut-transfer/commit/ac78f86))



<a name="6.11.2"></a>
## [6.11.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.11.1...v6.11.2) (2017-05-17)


### Bug Fixes

* pass expected parameters ([e893c24](https://github.com/softwaregroup-bg/ut-transfer/commit/e893c24))



<a name="6.11.1"></a>
## [6.11.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.11.0...v6.11.1) (2017-05-16)


### Bug Fixes

* change function definition of ruleValidate ([#47](https://github.com/softwaregroup-bg/ut-transfer/issues/47)) ([6fc4b66](https://github.com/softwaregroup-bg/ut-transfer/commit/6fc4b66))



<a name="6.11.0"></a>
# [6.11.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.10.10...v6.11.0) (2017-05-16)


### Features

* record more details during transfer ([bcf454e](https://github.com/softwaregroup-bg/ut-transfer/commit/bcf454e))



<a name="6.10.10"></a>
## [6.10.10](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.10.9...v6.10.10) (2017-05-15)


### Bug Fixes

* remove classnames ([#46](https://github.com/softwaregroup-bg/ut-transfer/issues/46)) ([e9e590d](https://github.com/softwaregroup-bg/ut-transfer/commit/e9e590d))



<a name="6.10.9"></a>
## [6.10.9](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.10.8...v6.10.9) (2017-05-15)


### Bug Fixes

* improve reports ([aa58f8b](https://github.com/softwaregroup-bg/ut-transfer/commit/aa58f8b))



<a name="6.10.8"></a>
## [6.10.8](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.10.7...v6.10.8) (2017-05-15)


### Bug Fixes

* add event record when confirming issuer ([#45](https://github.com/softwaregroup-bg/ut-transfer/issues/45)) ([96a95ad](https://github.com/softwaregroup-bg/ut-transfer/commit/96a95ad))



<a name="6.10.7"></a>
## [6.10.7](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.10.6...v6.10.7) (2017-05-12)


### Bug Fixes

* add permission ([ee4011c](https://github.com/softwaregroup-bg/ut-transfer/commit/ee4011c))



<a name="6.10.6"></a>
## [6.10.6](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.10.5...v6.10.6) (2017-05-11)


### Bug Fixes

* include pagination in result and expect joi array instead of any in report validations ([#41](https://github.com/softwaregroup-bg/ut-transfer/issues/41)) ([738d598](https://github.com/softwaregroup-bg/ut-transfer/commit/738d598))



<a name="6.10.5"></a>
## [6.10.5](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.10.4...v6.10.5) (2017-05-11)


### Bug Fixes

* total amount/count, stats of successful txn, optimization ([886af8b](https://github.com/softwaregroup-bg/ut-transfer/commit/886af8b))



<a name="6.10.4"></a>
## [6.10.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.10.3...v6.10.4) (2017-05-11)


### Bug Fixes

* add success column in vTransfer ([2366b79](https://github.com/softwaregroup-bg/ut-transfer/commit/2366b79))



<a name="6.10.3"></a>
## [6.10.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.10.2...v6.10.3) (2017-05-11)


### Bug Fixes

* register export/print handlers and provide method and resultset name ([679b009](https://github.com/softwaregroup-bg/ut-transfer/commit/679b009))
* report column styles ([46246f9](https://github.com/softwaregroup-bg/ut-transfer/commit/46246f9))



<a name="6.10.2"></a>
## [6.10.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.10.1...v6.10.2) (2017-05-10)


### Bug Fixes

* version bump ([#36](https://github.com/softwaregroup-bg/ut-transfer/issues/36)) ([8e9bdba](https://github.com/softwaregroup-bg/ut-transfer/commit/8e9bdba))



<a name="6.10.1"></a>
## [6.10.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.10.0...v6.10.1) (2017-05-09)


### Bug Fixes

* parameters are datetime ([7570ea7](https://github.com/softwaregroup-bg/ut-transfer/commit/7570ea7))



<a name="6.10.0"></a>
# [6.10.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.9.5...v6.10.0) (2017-05-05)


### Bug Fixes

* optimization ([67d86b6](https://github.com/softwaregroup-bg/ut-transfer/commit/67d86b6))
* remove redundant filter ([#32](https://github.com/softwaregroup-bg/ut-transfer/issues/32)) ([3d66850](https://github.com/softwaregroup-bg/ut-transfer/commit/3d66850))
* set filter default values & rename transaction to transfer ([#33](https://github.com/softwaregroup-bg/ut-transfer/issues/33)) ([56ffca4](https://github.com/softwaregroup-bg/ut-transfer/commit/56ffca4))


### Features

* Settlement details report ([#34](https://github.com/softwaregroup-bg/ut-transfer/issues/34)) ([98a11c3](https://github.com/softwaregroup-bg/ut-transfer/commit/98a11c3))



<a name="6.9.5"></a>
## [6.9.5](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.9.4...v6.9.5) (2017-05-04)


### Bug Fixes

* handle iso channel ([ca7884c](https://github.com/softwaregroup-bg/ut-transfer/commit/ca7884c))



<a name="6.9.4"></a>
## [6.9.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.9.3...v6.9.4) (2017-05-03)


### Bug Fixes

* temporarily remove permission check ([9a8d6b1](https://github.com/softwaregroup-bg/ut-transfer/commit/9a8d6b1))



<a name="6.9.3"></a>
## [6.9.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.9.2...v6.9.3) (2017-05-03)


### Bug Fixes

* order ([843adf5](https://github.com/softwaregroup-bg/ut-transfer/commit/843adf5))



<a name="6.9.2"></a>
## [6.9.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.9.1...v6.9.2) (2017-05-03)


### Bug Fixes

* use proper functions ([60157e1](https://github.com/softwaregroup-bg/ut-transfer/commit/60157e1))



<a name="6.9.1"></a>
## [6.9.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.9.0...v6.9.1) (2017-05-03)


### Bug Fixes

* settlement and transfer reports ([de10492](https://github.com/softwaregroup-bg/ut-transfer/commit/de10492))
* settlement date ([7f5eca5](https://github.com/softwaregroup-bg/ut-transfer/commit/7f5eca5))



<a name="6.9.0"></a>
# [6.9.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.8.1...v6.9.0) (2017-05-02)


### Features

* add bulk payments front end and backend method validations ([#28](https://github.com/softwaregroup-bg/ut-transfer/issues/28)) ([794f2eb](https://github.com/softwaregroup-bg/ut-transfer/commit/794f2eb))



<a name="6.8.1"></a>
## [6.8.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.8.0...v6.8.1) (2017-05-02)


### Bug Fixes

* add filter default value && datetime format strings ([691fffa](https://github.com/softwaregroup-bg/ut-transfer/commit/691fffa))
* apply classnames ([ddcfae9](https://github.com/softwaregroup-bg/ut-transfer/commit/ddcfae9))
* move transfer report procedure to module ([380c02e](https://github.com/softwaregroup-bg/ut-transfer/commit/380c02e))
* remove seconds ([3fd8508](https://github.com/softwaregroup-bg/ut-transfer/commit/3fd8508))



<a name="6.8.0"></a>
# [6.8.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.7.4...v6.8.0) (2017-05-02)


### Features

* add settlement report procedure ([cd0b928](https://github.com/softwaregroup-bg/ut-transfer/commit/cd0b928))



<a name="6.7.4"></a>
## [6.7.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.7.3...v6.7.4) (2017-05-02)


### Bug Fixes

* format date ([067ec22](https://github.com/softwaregroup-bg/ut-transfer/commit/067ec22))



<a name="6.7.3"></a>
## [6.7.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.7.2...v6.7.3) (2017-05-02)


### Bug Fixes

* use proper state ([be6d994](https://github.com/softwaregroup-bg/ut-transfer/commit/be6d994))



<a name="6.7.2"></a>
## [6.7.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.7.1...v6.7.2) (2017-04-28)


### Bug Fixes

* cyrillic O ([5db5beb](https://github.com/softwaregroup-bg/ut-transfer/commit/5db5beb))



<a name="6.7.1"></a>
## [6.7.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.7.0...v6.7.1) (2017-04-28)


### Bug Fixes

* move partner.fetch validation in db folder ([#29](https://github.com/softwaregroup-bg/ut-transfer/issues/29)) ([03a25d5](https://github.com/softwaregroup-bg/ut-transfer/commit/03a25d5))



<a name="6.7.0"></a>
# [6.7.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.6.9...v6.7.0) (2017-04-28)


### Features

* add procedure and validation for partner.fetch ([#27](https://github.com/softwaregroup-bg/ut-transfer/issues/27)) ([08864eb](https://github.com/softwaregroup-bg/ut-transfer/commit/08864eb))



<a name="6.6.9"></a>
## [6.6.9](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.6.8...v6.6.9) (2017-04-28)


### Bug Fixes

* reverse uses state 4 ([fe3fe15](https://github.com/softwaregroup-bg/ut-transfer/commit/fe3fe15))



<a name="6.6.8"></a>
## [6.6.8](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.6.7...v6.6.8) (2017-04-28)


### Bug Fixes

* fail with proper state 3 ([86224f6](https://github.com/softwaregroup-bg/ut-transfer/commit/86224f6))



<a name="6.6.7"></a>
## [6.6.7](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.6.6...v6.6.7) (2017-04-26)


### Bug Fixes

* validations ([#26](https://github.com/softwaregroup-bg/ut-transfer/issues/26)) ([d8fa39f](https://github.com/softwaregroup-bg/ut-transfer/commit/d8fa39f))



<a name="6.6.6"></a>
## [6.6.6](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.6.5...v6.6.6) (2017-04-24)


### Bug Fixes

* add currency column to transfer statistics ([#25](https://github.com/softwaregroup-bg/ut-transfer/issues/25)) ([8dbd6b6](https://github.com/softwaregroup-bg/ut-transfer/commit/8dbd6b6))



<a name="6.6.5"></a>
## [6.6.5](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.6.4...v6.6.5) (2017-04-24)



<a name="6.6.4"></a>
## [6.6.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.6.3...v6.6.4) (2017-04-20)



<a name="6.6.3"></a>
## [6.6.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.6.2...v6.6.3) (2017-04-19)


### Bug Fixes

* typo ([35b11ff](https://github.com/softwaregroup-bg/ut-transfer/commit/35b11ff))



<a name="6.6.2"></a>
## [6.6.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.6.1...v6.6.2) (2017-04-19)


### Bug Fixes

* rename 1/2 ([95ef9ea](https://github.com/softwaregroup-bg/ut-transfer/commit/95ef9ea))
* rename 2/2 ([a1d2b7f](https://github.com/softwaregroup-bg/ut-transfer/commit/a1d2b7f))



<a name="6.6.1"></a>
## [6.6.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.6.0...v6.6.1) (2017-04-19)


### Bug Fixes

* camelcase ([b052ab7](https://github.com/softwaregroup-bg/ut-transfer/commit/b052ab7))



<a name="6.6.0"></a>
# [6.6.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.5.2...v6.6.0) (2017-04-14)


### Features

* reports ([23506d9](https://github.com/softwaregroup-bg/ut-transfer/commit/23506d9))



<a name="6.5.2"></a>
## [6.5.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.5.1...v6.5.2) (2017-04-12)


### Bug Fixes

* push.execute result validations ([#18](https://github.com/softwaregroup-bg/ut-transfer/issues/18)) ([1f7889f](https://github.com/softwaregroup-bg/ut-transfer/commit/1f7889f))



<a name="6.5.1"></a>
## [6.5.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.5.0...v6.5.1) (2017-04-10)


### Bug Fixes

* renamed procedures ([#16](https://github.com/softwaregroup-bg/ut-transfer/issues/16)) ([c481862](https://github.com/softwaregroup-bg/ut-transfer/commit/c481862))



<a name="6.5.0"></a>
# [6.5.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.4.1...v6.5.0) (2017-04-10)


### Bug Fixes

* push.execute result validations ([#15](https://github.com/softwaregroup-bg/ut-transfer/issues/15)) ([131e0a5](https://github.com/softwaregroup-bg/ut-transfer/commit/131e0a5))


### Features

* rename procedures and move AVERAGE before TOTAL in results ([#14](https://github.com/softwaregroup-bg/ut-transfer/issues/14)) ([381f4bf](https://github.com/softwaregroup-bg/ut-transfer/commit/381f4bf))



<a name="6.4.1"></a>
## [6.4.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.4.0...v6.4.1) (2017-04-10)


### Bug Fixes

* push.execute validations add amount object ([#13](https://github.com/softwaregroup-bg/ut-transfer/issues/13)) ([48b5ce2](https://github.com/softwaregroup-bg/ut-transfer/commit/48b5ce2))



<a name="6.4.0"></a>
# [6.4.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.3.1...v6.4.0) (2017-04-07)


### Features

* support mini statement result ([aed08ac](https://github.com/softwaregroup-bg/ut-transfer/commit/aed08ac))



<a name="6.3.1"></a>
## [6.3.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.3.0...v6.3.1) (2017-04-07)


### Bug Fixes

* include tranfer currency filter in joi validation ([#10](https://github.com/softwaregroup-bg/ut-transfer/issues/10)) ([d937ee4](https://github.com/softwaregroup-bg/ut-transfer/commit/d937ee4))



<a name="6.3.0"></a>
# [6.3.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.2.0...v6.3.0) (2017-04-06)


### Features

* add currency parameter in grouping categories ([#9](https://github.com/softwaregroup-bg/ut-transfer/issues/9)) ([70cc7ca](https://github.com/softwaregroup-bg/ut-transfer/commit/70cc7ca))



<a name="6.2.0"></a>
# [6.2.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.1.1...v6.2.0) (2017-04-06)


### Features

* report validations ([f130947](https://github.com/softwaregroup-bg/ut-transfer/commit/f130947))



<a name="6.1.1"></a>
## [6.1.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.1.0...v6.1.1) (2017-04-05)


### Bug Fixes

* fix bad query ([2d879a3](https://github.com/softwaregroup-bg/ut-transfer/commit/2d879a3))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.0.3...v6.1.0) (2017-04-05)


### Features

* reports ([63e664e](https://github.com/softwaregroup-bg/ut-transfer/commit/63e664e))



<a name="6.0.3"></a>
## [6.0.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.0.2...v6.0.3) (2017-04-04)


### Bug Fixes

* update ut-rule ([24fdbf3](https://github.com/softwaregroup-bg/ut-transfer/commit/24fdbf3))



<a name="6.0.2"></a>
## [6.0.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.0.1...v6.0.2) (2017-04-03)


### Bug Fixes

* dependencies ([f677008](https://github.com/softwaregroup-bg/ut-transfer/commit/f677008))



<a name="6.0.1"></a>
## [6.0.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v6.0.0...v6.0.1) (2017-03-23)


### Bug Fixes

* dependencies ([2a3d54a](https://github.com/softwaregroup-bg/ut-transfer/commit/2a3d54a))
* reversal handling ([2530489](https://github.com/softwaregroup-bg/ut-transfer/commit/2530489))



<a name="6.0.0"></a>
# [6.0.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.17.3...v6.0.0) (2017-03-17)


### Features

* improve acquirer transfers ([f769e0c](https://github.com/softwaregroup-bg/ut-transfer/commit/f769e0c))


### BREAKING CHANGES

* parameter destinationId is removed from transfer.push.execute and instead, issuerId and ledgerId should be used.



<a name="5.17.3"></a>
## [5.17.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.17.2...v5.17.3) (2017-03-08)


### Bug Fixes

* dependencies ([61a26f6](https://github.com/softwaregroup-bg/ut-transfer/commit/61a26f6))



<a name="5.17.2"></a>
## [5.17.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.17.1...v5.17.2) (2017-02-24)


### Bug Fixes

* rename state ([fac8b0d](https://github.com/softwaregroup-bg/ut-transfer/commit/fac8b0d))
* show reversed transactions in the report ([7c00c4f](https://github.com/softwaregroup-bg/ut-transfer/commit/7c00c4f))



<a name="5.17.1"></a>
## [5.17.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.17.0...v5.17.1) (2017-02-24)


### Bug Fixes

* add columns to vTransferEvent ([9eeb963](https://github.com/softwaregroup-bg/ut-transfer/commit/9eeb963))



<a name="5.17.0"></a>
# [5.17.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.16.1...v5.17.0) (2017-02-21)


### Features

* added reversed column in vTransferEvent ([4238344](https://github.com/softwaregroup-bg/ut-transfer/commit/4238344))



<a name="5.16.1"></a>
## [5.16.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.16.0...v5.16.1) (2017-02-20)


### Bug Fixes

* renamed fields ([112c0a6](https://github.com/softwaregroup-bg/ut-transfer/commit/112c0a6))



<a name="5.16.0"></a>
# [5.16.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.15.5...v5.16.0) (2017-02-19)


### Bug Fixes

* sms registration ([b43395d](https://github.com/softwaregroup-bg/ut-transfer/commit/b43395d))


### Features

* added cardAlert & cashAlert info to vTransferEvent ([f63a6ee](https://github.com/softwaregroup-bg/ut-transfer/commit/f63a6ee))
* vTransferEvent view added ([f82926c](https://github.com/softwaregroup-bg/ut-transfer/commit/f82926c))



<a name="5.15.5"></a>
## [5.15.5](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.15.4...v5.15.5) (2017-02-19)


### Bug Fixes

* pass account types ([6f70e74](https://github.com/softwaregroup-bg/ut-transfer/commit/6f70e74))



<a name="5.15.4"></a>
## [5.15.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.15.3...v5.15.4) (2017-02-18)


### Bug Fixes

* change pin skip destination ([bed0d82](https://github.com/softwaregroup-bg/ut-transfer/commit/bed0d82))



<a name="5.15.3"></a>
## [5.15.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.15.2...v5.15.3) (2017-02-18)


### Bug Fixes

* destination handling for cards ([c8ee181](https://github.com/softwaregroup-bg/ut-transfer/commit/c8ee181))
* handle expiration ([9ec27eb](https://github.com/softwaregroup-bg/ut-transfer/commit/9ec27eb))



<a name="5.15.2"></a>
## [5.15.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.15.1...v5.15.2) (2017-02-14)


### Bug Fixes

* pass fees ([f035192](https://github.com/softwaregroup-bg/ut-transfer/commit/f035192))



<a name="5.15.1"></a>
## [5.15.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.15.0...v5.15.1) (2017-02-14)


### Bug Fixes

* handle limits ([b3190eb](https://github.com/softwaregroup-bg/ut-transfer/commit/b3190eb))



<a name="5.15.0"></a>
# [5.15.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.14.2...v5.15.0) (2017-02-13)


### Features

* add column state to transfer.event ([ed275c3](https://github.com/softwaregroup-bg/ut-transfer/commit/ed275c3))



<a name="5.14.2"></a>
## [5.14.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.14.1...v5.14.2) (2017-02-13)


### Bug Fixes

* pass new PIN ([2e0f874](https://github.com/softwaregroup-bg/ut-transfer/commit/2e0f874))



<a name="5.14.1"></a>
## [5.14.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.14.0...v5.14.1) (2017-02-13)


### Bug Fixes

* update ut-rule ([b530f21](https://github.com/softwaregroup-bg/ut-transfer/commit/b530f21))



<a name="5.14.0"></a>
# [5.14.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.13.0...v5.14.0) (2017-02-12)


### Features

* add abortAcquirer ([a2a9e31](https://github.com/softwaregroup-bg/ut-transfer/commit/a2a9e31))



<a name="5.13.0"></a>
# [5.13.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.12.0...v5.13.0) (2017-02-12)


### Features

* implement transfer.push.reverse ([fb7e72c](https://github.com/softwaregroup-bg/ut-transfer/commit/fb7e72c))



<a name="5.12.0"></a>
# [5.12.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.14...v5.12.0) (2017-02-11)


### Features

* added merchant unknown error ([818203a](https://github.com/softwaregroup-bg/ut-transfer/commit/818203a))



<a name="5.11.14"></a>
## [5.11.14](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.13...v5.11.14) (2017-02-11)


### Bug Fixes

* error handling ([4a6398b](https://github.com/softwaregroup-bg/ut-transfer/commit/4a6398b))



<a name="5.11.13"></a>
## [5.11.13](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.12...v5.11.13) (2017-02-10)


### Bug Fixes

* move code to ut-iso ([d7de979](https://github.com/softwaregroup-bg/ut-transfer/commit/d7de979))



<a name="5.11.12"></a>
## [5.11.12](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.11...v5.11.12) (2017-02-10)


### Bug Fixes

* use correct column names ([4e71ab2](https://github.com/softwaregroup-bg/ut-transfer/commit/4e71ab2))



<a name="5.11.11"></a>
## [5.11.11](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.10...v5.11.11) (2017-02-09)



<a name="5.11.10"></a>
## [5.11.10](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.9...v5.11.10) (2017-02-09)



<a name="5.11.9"></a>
## [5.11.9](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.8...v5.11.9) (2017-02-09)



<a name="5.11.8"></a>
## [5.11.8](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.7...v5.11.8) (2017-02-09)



<a name="5.11.7"></a>
## [5.11.7](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.6...v5.11.7) (2017-02-09)



<a name="5.11.6"></a>
## [5.11.6](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.5...v5.11.6) (2017-02-09)



<a name="5.11.5"></a>
## [5.11.5](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.4...v5.11.5) (2017-02-09)



<a name="5.11.4"></a>
## [5.11.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.3...v5.11.4) (2017-02-09)



<a name="5.11.3"></a>
## [5.11.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.2...v5.11.3) (2017-02-09)



<a name="5.11.2"></a>
## [5.11.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.1...v5.11.2) (2017-02-09)



<a name="5.11.1"></a>
## [5.11.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.11.0...v5.11.1) (2017-02-09)


### Bug Fixes

* define merchant errors ([b9ef761](https://github.com/softwaregroup-bg/ut-transfer/commit/b9ef761))



<a name="5.11.0"></a>
# [5.11.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.10.3...v5.11.0) (2017-02-08)


### Features

* add iso error mapping ([70421da](https://github.com/softwaregroup-bg/ut-transfer/commit/70421da))



<a name="5.10.3"></a>
## [5.10.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.10.2...v5.10.3) (2017-02-08)



<a name="5.10.2"></a>
## [5.10.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.10.1...v5.10.2) (2017-02-08)



<a name="5.10.1"></a>
## [5.10.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.10.0...v5.10.1) (2017-02-08)


### Bug Fixes

* improve iso handling ([d38b09e](https://github.com/softwaregroup-bg/ut-transfer/commit/d38b09e))



<a name="5.10.0"></a>
# [5.10.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.9.2...v5.10.0) (2017-02-07)


### Features

* add card.execute ([4559314](https://github.com/softwaregroup-bg/ut-transfer/commit/4559314))



<a name="5.9.2"></a>
## [5.9.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.9.1...v5.9.2) (2017-02-07)



<a name="5.9.1"></a>
## [5.9.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.9.0...v5.9.1) (2017-02-07)



<a name="5.9.0"></a>
# [5.9.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.8.0...v5.9.0) (2017-02-05)


### Features

* **balance:** added field 54 in toISO result ([4266e9c](https://github.com/softwaregroup-bg/ut-transfer/commit/4266e9c))



<a name="5.8.0"></a>
# [5.8.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.7.3...v5.8.0) (2017-02-05)


### Features

* reversals 2 ([cc0f9d4](https://github.com/softwaregroup-bg/ut-transfer/commit/cc0f9d4))



<a name="5.7.3"></a>
## [5.7.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.7.2...v5.7.3) (2017-02-04)



<a name="5.7.2"></a>
## [5.7.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.7.1...v5.7.2) (2017-02-04)



<a name="5.7.1"></a>
## [5.7.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.7.0...v5.7.1) (2017-02-04)


### Bug Fixes

* remove catch ([67a0033](https://github.com/softwaregroup-bg/ut-transfer/commit/67a0033))
* remove dependency ([1e0e41f](https://github.com/softwaregroup-bg/ut-transfer/commit/1e0e41f))



<a name="5.7.0"></a>
# [5.7.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.6.0...v5.7.0) (2017-02-04)


### Features

* **iso:** added transferType to parser ([a13777a](https://github.com/softwaregroup-bg/ut-transfer/commit/a13777a))



<a name="5.6.0"></a>
# [5.6.0](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.33...v5.6.0) (2017-02-04)


### Features

* reversals 1 ([0ecffe5](https://github.com/softwaregroup-bg/ut-transfer/commit/0ecffe5))



<a name="5.5.33"></a>
## [5.5.33](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.32...v5.5.33) (2017-02-03)



<a name="5.5.32"></a>
## [5.5.32](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.31...v5.5.32) (2017-02-03)



<a name="5.5.31"></a>
## [5.5.31](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.30...v5.5.31) (2017-02-03)



<a name="5.5.30"></a>
## [5.5.30](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.29...v5.5.30) (2017-02-03)



<a name="5.5.29"></a>
## [5.5.29](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.28...v5.5.29) (2017-02-03)



<a name="5.5.28"></a>
## [5.5.28](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.27...v5.5.28) (2017-02-03)



<a name="5.5.27"></a>
## [5.5.27](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.26...v5.5.27) (2017-02-03)



<a name="5.5.26"></a>
## [5.5.26](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.25...v5.5.26) (2017-02-03)



<a name="5.5.25"></a>
## [5.5.25](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.24...v5.5.25) (2017-02-03)



<a name="5.5.24"></a>
## [5.5.24](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.23...v5.5.24) (2017-02-03)



<a name="5.5.23"></a>
## [5.5.23](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.22...v5.5.23) (2017-02-03)



<a name="5.5.22"></a>
## [5.5.22](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.21...v5.5.22) (2017-02-03)



<a name="5.5.21"></a>
## [5.5.21](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.20...v5.5.21) (2017-02-02)



<a name="5.5.20"></a>
## [5.5.20](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.19...v5.5.20) (2017-02-02)



<a name="5.5.19"></a>
## [5.5.19](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.18...v5.5.19) (2017-02-02)



<a name="5.5.18"></a>
## [5.5.18](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.17...v5.5.18) (2017-02-02)



<a name="5.5.17"></a>
## [5.5.17](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.16...v5.5.17) (2017-02-02)



<a name="5.5.16"></a>
## [5.5.16](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.15...v5.5.16) (2017-02-02)



<a name="5.5.15"></a>
## [5.5.15](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.14...v5.5.15) (2017-02-01)



<a name="5.5.14"></a>
## [5.5.14](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.13...v5.5.14) (2017-02-01)



<a name="5.5.13"></a>
## [5.5.13](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.12...v5.5.13) (2017-02-01)



<a name="5.5.12"></a>
## [5.5.12](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.11...v5.5.12) (2017-02-01)



<a name="5.5.11"></a>
## [5.5.11](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.10...v5.5.11) (2017-02-01)



<a name="5.5.10"></a>
## [5.5.10](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.9...v5.5.10) (2017-02-01)



<a name="5.5.9"></a>
## [5.5.9](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.8...v5.5.9) (2017-02-01)



<a name="5.5.8"></a>
## [5.5.8](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.7...v5.5.8) (2017-02-01)



<a name="5.5.7"></a>
## [5.5.7](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.6...v5.5.7) (2017-02-01)



<a name="5.5.6"></a>
## [5.5.6](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.5...v5.5.6) (2017-02-01)



<a name="5.5.5"></a>
## [5.5.5](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.4...v5.5.5) (2017-01-31)



<a name="5.5.4"></a>
## [5.5.4](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.3...v5.5.4) (2017-01-31)



<a name="5.5.3"></a>
## [5.5.3](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.2...v5.5.3) (2017-01-30)



<a name="5.5.2"></a>
## [5.5.2](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.1...v5.5.2) (2017-01-30)



<a name="5.5.1"></a>
## [5.5.1](https://github.com/softwaregroup-bg/ut-transfer/compare/v5.5.0...v5.5.1) (2017-01-27)


### Bug Fixes

* improve ISO ([c5e8491](https://github.com/softwaregroup-bg/ut-transfer/commit/c5e8491))



<a name="5.5.0"></a>
# 5.5.0 (2017-01-24)


### Bug Fixes

* add fee ([16b97b9](https://github.com/softwaregroup-bg/ut-transfer/commit/16b97b9))
* add missing dependency ([1431fc2](https://github.com/softwaregroup-bg/ut-transfer/commit/1431fc2))
* basic error handling ([51d2bc8](https://github.com/softwaregroup-bg/ut-transfer/commit/51d2bc8))
* finish the request/confirm/fail/reverse procs ([4a96968](https://github.com/softwaregroup-bg/ut-transfer/commit/4a96968))
* typos ([5c756fb](https://github.com/softwaregroup-bg/ut-transfer/commit/5c756fb))
* update dependencies ([68f2922](https://github.com/softwaregroup-bg/ut-transfer/commit/68f2922))


### Features

* add merchant and rule steps ([464ee7e](https://github.com/softwaregroup-bg/ut-transfer/commit/464ee7e))
* add splits ([827feac](https://github.com/softwaregroup-bg/ut-transfer/commit/827feac))
* add transfer.partner ([907436b](https://github.com/softwaregroup-bg/ut-transfer/commit/907436b))
* add vTransfer ([a1a9ab9](https://github.com/softwaregroup-bg/ut-transfer/commit/a1a9ab9))
* check last transaction ([1f874e7](https://github.com/softwaregroup-bg/ut-transfer/commit/1f874e7))
* create event table for all events and errors ([0fc6b07](https://github.com/softwaregroup-bg/ut-transfer/commit/0fc6b07))
* implement basic transfer.push ([67026e0](https://github.com/softwaregroup-bg/ut-transfer/commit/67026e0))
* UIS-767 add push.execute validations for httpserver registration ([83c8d4a](https://github.com/softwaregroup-bg/ut-transfer/commit/83c8d4a))



