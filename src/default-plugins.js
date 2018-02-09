const Candlestick = require('./plugins/plots/candlestick');
const OHLC = require('./plugins/plots/ohlc');
const Line = require('./plugins/plots/line');
const Area = require('./plugins/plots/area');
const HeikinAshi = require('./plugins/plots/heikin-ashi');

const Market = require('./plugins/tools/market');
const Type = require('./plugins/tools/type');
const Indicators = require('./plugins/tools/indicators');
const Granularity = require('./plugins/tools/granularity');

const Volume = require('./plugins/indicators/volume');
const RSI = require('./plugins/indicators/rsi');
// const MACD = require('./plugins/indicators/macd');

const CurrentValue = require('./plugins/overlays/current-value');
const SMA = require('./plugins/overlays/sma');
const BollingerBands = require('./plugins/overlays/bollinger-bands');
// const IchimokuCloud = require('./plugins/overlays/ichimoku-cloud');

const Crosshair = require('./plugins/other/crosshair');

module.exports = [
    Candlestick,
    OHLC,
    Line,
    Area,
    HeikinAshi,
    Market,
    Indicators,
    Type,
    Volume,
    RSI,
    CurrentValue,
    SMA,
    Granularity,
    BollingerBands,
    // IchimokuCloud,
    // MACD
    Crosshair
];
