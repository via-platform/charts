const Candlestick = require('./plugins/plots/candlestick');
const OHLC = require('./plugins/plots/ohlc');
const Line = require('./plugins/plots/line');
const Area = require('./plugins/plots/area');
const HeikinAshi = require('./plugins/plots/heikin-ashi');

const Market = require('./plugins/tools/market');
const Type = require('./plugins/tools/type');
const Indicators = require('./plugins/tools/indicators');
const Granularity = require('./plugins/tools/granularity');
const Draw = require('./plugins/tools/draw');

const Volume = require('./plugins/indicators/volume');
const Trades = require('./plugins/indicators/trades');
const RSI = require('./plugins/indicators/rsi');
// const MACD = require('./plugins/indicators/macd');

const CurrentValue = require('./plugins/overlays/current-value');
const SMA = require('./plugins/overlays/sma');
const EMA = require('./plugins/overlays/ema');
const BollingerBands = require('./plugins/overlays/bollinger-bands');
const BidAsk = require('./plugins/overlays/bid-ask');
// const IchimokuCloud = require('./plugins/overlays/ichimoku-cloud');

const Crosshair = require('./plugins/other/crosshair');
const QuickMeasure = require('./plugins/other/quick-measure');

const HorizontalLine = require('./plugins/drawings/horizontal-line');
const VerticalLine = require('./plugins/drawings/vertical-line');
const Measure = require('./plugins/drawings/measure');
const DateValueRange = require('./plugins/drawings/date-value-range');
// const Circle = require('./plugins/drawings/circle');

module.exports = [
    Candlestick,
    OHLC,
    Line,
    Area,
    HeikinAshi,
    Market,
    Indicators,
    Draw,
    Type,
    Volume,
    Trades,
    RSI,
    CurrentValue,
    SMA,
    // EMA,
    Granularity,
    BollingerBands,
    BidAsk,
    // IchimokuCloud,
    // MACD
    Crosshair,
    QuickMeasure,
    HorizontalLine,
    VerticalLine,
    Measure,
    DateValueRange//,
    // Circle
];
