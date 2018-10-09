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
const VolumeNotional = require('./plugins/indicators/volume-notional');
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
// const ShadowValue = require('./plugins/other/shadow-value');
// const ReferenceMarket = require('./plugins/other/reference-market');
const QuickMeasure = require('./plugins/other/quick-measure');

const HorizontalLine = require('./plugins/drawings/horizontal-line');
const VerticalLine = require('./plugins/drawings/vertical-line');
const Measure = require('./plugins/drawings/measure');
const DateValueRange = require('./plugins/drawings/date-value-range');
const Ellipse = require('./plugins/drawings/ellipse');
const Rectangle = require('./plugins/drawings/rectangle');
const Triangle = require('./plugins/drawings/triangle');
const Parallelogram = require('./plugins/drawings/parallelogram');
const ArbitraryLine = require('./plugins/drawings/arbitrary-line');
const FibonacciRetracement = require('./plugins/drawings/fibonacci-retracement');
const LocalHighLow = require('./plugins/overlays/local-high-low');
const VolumeProfile = require('./plugins/overlays/volume-profile');

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
    VolumeNotional,
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
    // ShadowValue,
    // ReferenceMarket,
    QuickMeasure,
    HorizontalLine,
    VerticalLine,
    Measure,
    DateValueRange,
    Ellipse,
    Rectangle,
    Triangle,
    Parallelogram,
    ArbitraryLine,
    FibonacciRetracement,
    LocalHighLow,
    VolumeProfile
];
