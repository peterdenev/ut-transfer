// currency data obtained from http://www.currency-iso.org/en/home/tables/table-a1.html

const ALPHABETIC = {
    AED: '784',
    AFN: '971',
    ALL: '008',
    AMD: '051',
    ANG: '532',
    AOA: '973',
    ARS: '032',
    AUD: '036',
    AWG: '533',
    AZN: '944',
    BAM: '977',
    BBD: '052',
    BDT: '050',
    BGN: '975',
    BHD: '048',
    BIF: '108',
    BMD: '060',
    BND: '096',
    BOB: '068',
    BOV: '984',
    BRL: '986',
    BSD: '044',
    BTN: '064',
    BWP: '072',
    BYN: '933',
    BYR: '974',
    BZD: '084',
    CAD: '124',
    CDF: '976',
    CHE: '947',
    CHF: '756',
    CHW: '948',
    CLF: '990',
    CLP: '152',
    CNY: '156',
    COP: '170',
    COU: '970',
    CRC: '188',
    CUC: '931',
    CUP: '192',
    CVE: '132',
    CZK: '203',
    DJF: '262',
    DKK: '208',
    DOP: '214',
    DZD: '012',
    EGP: '818',
    ERN: '232',
    ETB: '230',
    EUR: '978',
    FJD: '242',
    FKP: '238',
    GBP: '826',
    GEL: '981',
    GHS: '936',
    GIP: '292',
    GMD: '270',
    GNF: '324',
    GTQ: '320',
    GYD: '328',
    HKD: '344',
    HNL: '340',
    HRK: '191',
    HTG: '332',
    HUF: '348',
    IDR: '360',
    ILS: '376',
    INR: '356',
    IQD: '368',
    IRR: '364',
    ISK: '352',
    JMD: '388',
    JOD: '400',
    JPY: '392',
    KES: '404',
    KGS: '417',
    KHR: '116',
    KMF: '174',
    KPW: '408',
    KRW: '410',
    KWD: '414',
    KYD: '136',
    KZT: '398',
    LAK: '418',
    LBP: '422',
    LKR: '144',
    LRD: '430',
    LSL: '426',
    LYD: '434',
    MAD: '504',
    MDL: '498',
    MGA: '969',
    MKD: '807',
    MMK: '104',
    MNT: '496',
    MOP: '446',
    MRO: '478',
    MUR: '480',
    MVR: '462',
    MWK: '454',
    MXN: '484',
    MXV: '979',
    MYR: '458',
    MZN: '943',
    NAD: '516',
    NGN: '566',
    NIO: '558',
    NOK: '578',
    NPR: '524',
    NZD: '554',
    OMR: '512',
    PAB: '590',
    PEN: '604',
    PGK: '598',
    PHP: '608',
    PKR: '586',
    PLN: '985',
    PYG: '600',
    QAR: '634',
    RON: '946',
    RSD: '941',
    RUB: '643',
    RWF: '646',
    SAR: '682',
    SBD: '090',
    SCR: '690',
    SDG: '938',
    SEK: '752',
    SGD: '702',
    SHP: '654',
    SLL: '694',
    SOS: '706',
    SRD: '968',
    SSP: '728',
    STD: '678',
    SVC: '222',
    SYP: '760',
    SZL: '748',
    THB: '764',
    TJS: '972',
    TMT: '934',
    TND: '788',
    TOP: '776',
    TRY: '949',
    TTD: '780',
    TWD: '901',
    TZS: '834',
    UAH: '980',
    UGX: '800',
    USD: '840',
    USN: '997',
    UYI: '940',
    UYU: '858',
    UZS: '860',
    VEF: '937',
    VND: '704',
    VUV: '548',
    WST: '882',
    CFA: '950',
    XCD: '951',
    XOF: '952',
    XPF: '953',
    YER: '886',
    ZAR: '710',
    ZMW: '967',
    ZWL: '932'
};

var NUMERIC = {
    '008': 'ALL',
    '012': 'DZD',
    '032': 'ARS',
    '036': 'AUD',
    '044': 'BSD',
    '048': 'BHD',
    '050': 'BDT',
    '051': 'AMD',
    '052': 'BBD',
    '060': 'BMD',
    '064': 'BTN',
    '068': 'BOB',
    '072': 'BWP',
    '084': 'BZD',
    '090': 'SBD',
    '096': 'BND',
    '104': 'MMK',
    '108': 'BIF',
    '116': 'KHR',
    '124': 'CAD',
    '132': 'CVE',
    '136': 'KYD',
    '144': 'LKR',
    '152': 'CLP',
    '156': 'CNY',
    '170': 'COP',
    '174': 'KMF',
    '188': 'CRC',
    '191': 'HRK',
    '192': 'CUP',
    '203': 'CZK',
    '208': 'DKK',
    '214': 'DOP',
    '222': 'SVC',
    '230': 'ETB',
    '232': 'ERN',
    '238': 'FKP',
    '242': 'FJD',
    '262': 'DJF',
    '270': 'GMD',
    '292': 'GIP',
    '320': 'GTQ',
    '324': 'GNF',
    '328': 'GYD',
    '332': 'HTG',
    '340': 'HNL',
    '344': 'HKD',
    '348': 'HUF',
    '352': 'ISK',
    '356': 'INR',
    '360': 'IDR',
    '364': 'IRR',
    '368': 'IQD',
    '376': 'ILS',
    '388': 'JMD',
    '392': 'JPY',
    '398': 'KZT',
    '400': 'JOD',
    '404': 'KES',
    '408': 'KPW',
    '410': 'KRW',
    '414': 'KWD',
    '417': 'KGS',
    '418': 'LAK',
    '422': 'LBP',
    '426': 'LSL',
    '430': 'LRD',
    '434': 'LYD',
    '446': 'MOP',
    '454': 'MWK',
    '458': 'MYR',
    '462': 'MVR',
    '478': 'MRO',
    '480': 'MUR',
    '484': 'MXN',
    '496': 'MNT',
    '498': 'MDL',
    '504': 'MAD',
    '512': 'OMR',
    '516': 'NAD',
    '524': 'NPR',
    '532': 'ANG',
    '533': 'AWG',
    '548': 'VUV',
    '554': 'NZD',
    '558': 'NIO',
    '566': 'NGN',
    '578': 'NOK',
    '586': 'PKR',
    '590': 'PAB',
    '598': 'PGK',
    '600': 'PYG',
    '604': 'PEN',
    '608': 'PHP',
    '634': 'QAR',
    '643': 'RUB',
    '646': 'RWF',
    '654': 'SHP',
    '678': 'STD',
    '682': 'SAR',
    '690': 'SCR',
    '694': 'SLL',
    '702': 'SGD',
    '704': 'VND',
    '706': 'SOS',
    '710': 'ZAR',
    '728': 'SSP',
    '748': 'SZL',
    '752': 'SEK',
    '756': 'CHF',
    '760': 'SYP',
    '764': 'THB',
    '776': 'TOP',
    '780': 'TTD',
    '784': 'AED',
    '788': 'TND',
    '800': 'UGX',
    '807': 'MKD',
    '818': 'EGP',
    '826': 'GBP',
    '834': 'TZS',
    '840': 'USD',
    '858': 'UYU',
    '860': 'UZS',
    '882': 'WST',
    '886': 'YER',
    '901': 'TWD',
    '931': 'CUC',
    '932': 'ZWL',
    '933': 'BYN',
    '934': 'TMT',
    '936': 'GHS',
    '937': 'VEF',
    '938': 'SDG',
    '940': 'UYI',
    '941': 'RSD',
    '943': 'MZN',
    '944': 'AZN',
    '946': 'RON',
    '947': 'CHE',
    '948': 'CHW',
    '949': 'TRY',
    '950': 'CFA',
    '951': 'XCD',
    '952': 'XOF',
    '953': 'XPF',
    '967': 'ZMW',
    '968': 'SRD',
    '969': 'MGA',
    '970': 'COU',
    '971': 'AFN',
    '972': 'TJS',
    '973': 'AOA',
    '974': 'BYR',
    '975': 'BGN',
    '976': 'CDF',
    '977': 'BAM',
    '978': 'EUR',
    '979': 'MXV',
    '980': 'UAH',
    '981': 'GEL',
    '984': 'BOV',
    '985': 'PLN',
    '986': 'BRL',
    '990': 'CLF',
    '997': 'USN'
};

var SCALE = {
    '008': 2,
    '012': 2,
    '032': 2,
    '036': 2,
    '044': 2,
    '048': 3,
    '050': 2,
    '051': 2,
    '052': 2,
    '060': 2,
    '064': 2,
    '068': 2,
    '072': 2,
    '084': 2,
    '090': 2,
    '096': 2,
    '104': 2,
    '108': 0,
    '116': 2,
    '124': 2,
    '132': 2,
    '136': 2,
    '144': 2,
    '152': 0,
    '156': 2,
    '170': 2,
    '174': 0,
    '188': 2,
    '191': 2,
    '192': 2,
    '203': 2,
    '208': 2,
    '214': 2,
    '222': 2,
    '230': 2,
    '232': 2,
    '238': 2,
    '242': 2,
    '262': 0,
    '270': 2,
    '292': 2,
    '320': 2,
    '324': 0,
    '328': 2,
    '332': 2,
    '340': 2,
    '344': 2,
    '348': 2,
    '352': 0,
    '356': 2,
    '360': 2,
    '364': 2,
    '368': 3,
    '376': 2,
    '388': 2,
    '392': 0,
    '398': 2,
    '400': 3,
    '404': 2,
    '408': 2,
    '410': 0,
    '414': 3,
    '417': 2,
    '418': 2,
    '422': 2,
    '426': 2,
    '430': 2,
    '434': 3,
    '446': 2,
    '454': 2,
    '458': 2,
    '462': 2,
    '478': 2,
    '480': 2,
    '484': 2,
    '496': 2,
    '498': 2,
    '504': 2,
    '512': 3,
    '516': 2,
    '524': 2,
    '532': 2,
    '533': 2,
    '548': 0,
    '554': 2,
    '558': 2,
    '566': 2,
    '578': 2,
    '586': 2,
    '590': 2,
    '598': 2,
    '600': 0,
    '604': 2,
    '608': 2,
    '634': 2,
    '643': 2,
    '646': 0,
    '654': 2,
    '678': 2,
    '682': 2,
    '690': 2,
    '694': 2,
    '702': 2,
    '704': 0,
    '706': 2,
    '710': 2,
    '728': 2,
    '748': 2,
    '752': 2,
    '756': 2,
    '760': 2,
    '764': 2,
    '776': 2,
    '780': 2,
    '784': 2,
    '788': 3,
    '800': 0,
    '807': 2,
    '818': 2,
    '826': 2,
    '834': 2,
    '840': 2,
    '858': 2,
    '860': 2,
    '882': 2,
    '886': 2,
    '901': 2,
    '931': 2,
    '932': 2,
    '933': 2,
    '934': 2,
    '936': 2,
    '937': 2,
    '938': 2,
    '940': 0,
    '941': 2,
    '943': 2,
    '944': 2,
    '946': 2,
    '947': 2,
    '948': 2,
    '949': 2,
    '950': 0,
    '951': 2,
    '952': 0,
    '953': 0,
    '967': 2,
    '968': 2,
    '969': 2,
    '970': 2,
    '971': 2,
    '972': 2,
    '973': 2,
    '974': 0,
    '975': 2,
    '976': 2,
    '977': 2,
    '978': 2,
    '979': 2,
    '980': 2,
    '981': 2,
    '984': 2,
    '985': 2,
    '986': 2,
    '990': 4,
    '997': 2,
    AED: 2,
    AFN: 2,
    ALL: 2,
    AMD: 2,
    ANG: 2,
    AOA: 2,
    ARS: 2,
    AUD: 2,
    AWG: 2,
    AZN: 2,
    BAM: 2,
    BBD: 2,
    BDT: 2,
    BGN: 2,
    BHD: 3,
    BIF: 0,
    BMD: 2,
    BND: 2,
    BOB: 2,
    BOV: 2,
    BRL: 2,
    BSD: 2,
    BTN: 2,
    BWP: 2,
    BYN: 2,
    BYR: 0,
    BZD: 2,
    CAD: 2,
    CDF: 2,
    CHE: 2,
    CHF: 2,
    CHW: 2,
    CLF: 4,
    CLP: 0,
    CNY: 2,
    COP: 2,
    COU: 2,
    CRC: 2,
    CUC: 2,
    CUP: 2,
    CVE: 2,
    CZK: 2,
    DJF: 0,
    DKK: 2,
    DOP: 2,
    DZD: 2,
    EGP: 2,
    ERN: 2,
    ETB: 2,
    EUR: 2,
    FJD: 2,
    FKP: 2,
    GBP: 2,
    GEL: 2,
    GHS: 2,
    GIP: 2,
    GMD: 2,
    GNF: 0,
    GTQ: 2,
    GYD: 2,
    HKD: 2,
    HNL: 2,
    HRK: 2,
    HTG: 2,
    HUF: 2,
    IDR: 2,
    ILS: 2,
    INR: 2,
    IQD: 3,
    IRR: 2,
    ISK: 0,
    JMD: 2,
    JOD: 3,
    JPY: 0,
    KES: 2,
    KGS: 2,
    KHR: 2,
    KMF: 0,
    KPW: 2,
    KRW: 0,
    KWD: 3,
    KYD: 2,
    KZT: 2,
    LAK: 2,
    LBP: 2,
    LKR: 2,
    LRD: 2,
    LSL: 2,
    LYD: 3,
    MAD: 2,
    MDL: 2,
    MGA: 2,
    MKD: 2,
    MMK: 2,
    MNT: 2,
    MOP: 2,
    MRO: 2,
    MUR: 2,
    MVR: 2,
    MWK: 2,
    MXN: 2,
    MXV: 2,
    MYR: 2,
    MZN: 2,
    NAD: 2,
    NGN: 2,
    NIO: 2,
    NOK: 2,
    NPR: 2,
    NZD: 2,
    OMR: 3,
    PAB: 2,
    PEN: 2,
    PGK: 2,
    PHP: 2,
    PKR: 2,
    PLN: 2,
    PYG: 0,
    QAR: 2,
    RON: 2,
    RSD: 2,
    RUB: 2,
    RWF: 0,
    SAR: 2,
    SBD: 2,
    SCR: 2,
    SDG: 2,
    SEK: 2,
    SGD: 2,
    SHP: 2,
    SLL: 2,
    SOS: 2,
    SRD: 2,
    SSP: 2,
    STD: 2,
    SVC: 2,
    SYP: 2,
    SZL: 2,
    THB: 2,
    TJS: 2,
    TMT: 2,
    TND: 3,
    TOP: 2,
    TRY: 2,
    TTD: 2,
    TWD: 2,
    TZS: 2,
    UAH: 2,
    UGX: 0,
    USD: 2,
    USN: 2,
    UYI: 0,
    UYU: 2,
    UZS: 2,
    VEF: 2,
    VND: 0,
    VUV: 0,
    WST: 2,
    CFA: 0,
    XCD: 2,
    XOF: 0,
    XPF: 0,
    YER: 2,
    ZAR: 2,
    ZMW: 2,
    ZWL: 2
};

var errors = require('./errors');

function alphabetic(code) {
    return ALPHABETIC[code] ? code : NUMERIC[code];
}

function numeric(code) {
    return NUMERIC[code] ? code : ALPHABETIC[code];
}

var amountObject = (cents, scale, sign, currency, string) => {
    var result = '00000' + cents;
    if (!Number.isInteger(parseInt(cents))) {
        throw errors.invalidAmount({params: {amount: string, currency}});
    } else if (scale > 0) {
        result = result.substr(0, result.length - scale) + '.' + result.slice(-scale);
    }
    result = result.match(/^0*(\d+(\.\d+)?)/); // strip leading zeroes
    return {
        currency: alphabetic(currency),
        amount: result && result[1],
        scale,
        cents: parseInt(cents) * sign
    };
};

function roundCents(value, exp) { // based on function decimalAdjust in Mozilla JS reference for Math.round
    if ((typeof value !== 'string' && typeof value !== 'number') || value === '') {
        return NaN;
    }
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math.round(value);
    }
    value = +value;
    exp = +exp;
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    if (value < 0) {
        return -roundCents(-value, exp);
    }
    value = value.toString().split('e');
    return Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : +exp)));
}

function getScale(code) {
    var scale = SCALE[code];
    if (scale == null || scale > 4) {
        throw errors.invalidCurrency({params: {currency: code}});
    }
    return scale;
}

module.exports = {
    numeric: numeric,
    alphabetic: alphabetic,
    scale: getScale,
    cents: (currency, cents, sign = 1) => amountObject(cents, getScale(currency), sign, currency, cents),
    amount: function(currency, amount, sign = 1) {
        var scale = getScale(currency);
        return amountObject(roundCents(amount, scale), scale, sign, currency, amount);
    }
};
