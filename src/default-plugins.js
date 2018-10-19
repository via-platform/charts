// require('./plugins/other/shadow-value'),
// require('./plugins/other/reference-market'),

module.exports = {
    plot: [
        require('./plots/candle')//,
        // require('./plots/line'),
        // require('./plots/bar'),
        // require('./plots/heikin-ashi'),
        // require('./plots/area'),
        // require('./plots/mountain')
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
        // require('./indicators/trades'),
        require('./indicators/rsi'),
        // require('./indicators/macd'),
        require('./indicators/sma'),
        // require('./indicators/ema'),
        // require('./indicators/bollinger-bands'),
        // require('./indicators/ichimoku-cloud')
    ],
    plugin: [
        require('./core/core-market'),
        // require('./core/core-data'),
        require('./core/core-plot'),
        require('./core/core-indicator'),
        require('./core/core-granularity'),
        require('./core/core-draw')//,
        // require('./plugins/crosshair'),
        // require('./plugins/bid-ask'),
        // require('./plugins/local-high-low'),
        // require('./plugins/volume-profile'),
        // require('./plugins/current-value'),
        // require('./plugins/quick-measure')
    ]
};