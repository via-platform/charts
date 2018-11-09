// require('./plugins/other/shadow-value'),
// require('./plugins/other/reference-market'),

module.exports = {
    type: [
        require('./types/candle'),
        require('./types/line'),
        require('./types/bar'),
        require('./types/heikin-ashi'),
        require('./types/area'),
        require('./types/mountain')//,
        // require('./types/hollow-candle'),
        // require('./types/baseline')
    ],
    plot: [
        require('./plots/area'),
        require('./plots/mountain'),
        require('./plots/line'),
        require('./plots/band'),
        require('./plots/stacked-bar'),
        require('./plots/circle'),
        require('./plots/cross'),
        require('./plots/histogram'),
        require('./plots/horizontal-line'),
        require('./plots/vertical-line'),
        require('./plots/plot'),
        require('./plots/step'),
        require('./plots/range')
    ],
    drawing: [
        require('./drawings/horizontal-line'),
        require('./drawings/vertical-line'),
        require('./drawings/measure'),
        require('./drawings/date-range'),
        require('./drawings/value-range'),
        require('./drawings/date-value-range'),
        require('./drawings/ellipse'),
        require('./drawings/rectangle'),
        require('./drawings/triangle'),
        require('./drawings/parallelogram'),
        require('./drawings/arbitrary-line'),
        require('./drawings/polyline'),
        require('./drawings/fibonacci-retracement')
    ],
    indicator: [
        require('./indicators/volume'),
        // require('./indicators/volume-notional'),
        require('./indicators/trade-volume-ratio'),
        require('./indicators/trade-count-ratio'),
        require('./indicators/trade-count'),
        require('./indicators/rsi'),
        // require('./indicators/macd'),
        require('./indicators/sma'),
        require('./indicators/parabolic-sar'),
        // require('./indicators/ema'),
        require('./indicators/bollinger-bands'),
        require('./indicators/vwap')
        // require('./indicators/ichimoku-cloud')
    ],
    plugin: [
        require('./plugins/core/market'),
        require('./plugins/core/type'),
        require('./plugins/core/indicator'),
        require('./plugins/core/granularity'),
        require('./plugins/core/draw'),
        require('./plugins/crosshair'),
        require('./plugins/bid-ask'),
        // require('./plugins/local-high-low'),
        // require('./plugins/current-value'),
        require('./plugins/volume-profile'),
        require('./plugins/quick-measure')
    ]
};
