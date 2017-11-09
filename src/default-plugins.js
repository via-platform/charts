const Candlestick = require('./plugins/plots/candlestick');
const OHLC = require('./plugins/plots/ohlc');
const Line = require('./plugins/plots/line');
const Area = require('./plugins/plots/area');

module.exports = [
    Candlestick,
    OHLC,
    Line,
    Area
];
