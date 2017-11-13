const Candlestick = require('./plugins/plots/candlestick');
const OHLC = require('./plugins/plots/ohlc');
const Line = require('./plugins/plots/line');
const Area = require('./plugins/plots/area');

const Symbol = require('./plugins/tools/symbol');
const Type = require('./plugins/tools/type');
const Indicators = require('./plugins/tools/indicators');

const Volume = require('./plugins/indicators/volume');

const SMA = require('./plugins/overlays/sma');

module.exports = [
    Candlestick,
    OHLC,
    Line,
    Area,
    Symbol,
    Indicators,
    Type,
    Volume,
    SMA,
];
