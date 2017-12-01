const Candlestick = require('./plugins/plots/candlestick');
const OHLC = require('./plugins/plots/ohlc');
const Line = require('./plugins/plots/line');
const Area = require('./plugins/plots/area');
const HeikinAshi = require('./plugins/plots/heikin-ashi');

const Symbol = require('./plugins/tools/symbol');
const Type = require('./plugins/tools/type');
const Indicators = require('./plugins/tools/indicators');
const Granularity = require('./plugins/tools/granularity');

const Volume = require('./plugins/indicators/volume');

const SMA = require('./plugins/overlays/sma');
const BollingerBands = require('./plugins/overlays/bollinger-bands');

module.exports = [
    Candlestick,
    OHLC,
    Line,
    Area,
    HeikinAshi,
    Symbol,
    Indicators,
    Type,
    Volume,
    SMA,
    Granularity,
    BollingerBands
];

//TODO
//Parabolic SAR
