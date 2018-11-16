module.exports = {
    type: [
        require('./types/candle'),
        require('./types/hollow-candle'),
        require('./types/line'),
        require('./types/bar'),
        require('./types/heikin-ashi'),
        require('./types/area'),
        require('./types/mountain'),
        require('./types/cluster'),
        require('./types/baseline')
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
        require('./plots/range'),
        require('./plots/horizontal-range')
    ],
    drawing: [
        require('./drawings/horizontal-line'),
        require('./drawings/vertical-line'),
        require('./drawings/measure'),
        require('./drawings/volume-profile-range'),
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
        require('./indicators/accumulation-distribution-line'),
        require('./indicators/alma'),
        require('./indicators/aroon'),
        require('./indicators/average-candle-range'),
        require('./indicators/average-true-range'),
        require('./indicators/awesome-oscillator'),
        require('./indicators/balance-of-power'),
        require('./indicators/bollinger-bands'),
        require('./indicators/bollinger-bandwidth'),
        require('./indicators/candle-range'),
        require('./indicators/chaikin-money-flow'),
        require('./indicators/chaikin-oscillator'),
        require('./indicators/double-ema'),
        require('./indicators/ema'),
        // require('./indicators/ichimoku-cloud'),
        require('./indicators/lsma'),
        require('./indicators/macd'),
        require('./indicators/ma-cross'),
        require('./indicators/money-flow'),
        require('./indicators/on-balance-volume'),
        // require('./indicators/parabolic-sar'),
        require('./indicators/price-volume-trend'),
        require('./indicators/rainbow-moving-average'),
        require('./indicators/rsi'),
        require('./indicators/sma'),
        require('./indicators/standard-deviation'),
        require('./indicators/stochastic'),
        require('./indicators/trade-count-ratio'),
        require('./indicators/trade-count'),
        require('./indicators/trade-volume-ratio'),
        require('./indicators/triple-ema'),
        require('./indicators/ultimate-oscillator'),
        require('./indicators/volume-notional'),
        require('./indicators/volume'),
        require('./indicators/vwap'),
        require('./indicators/vwma'),
        require('./indicators/wma')
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
        require('./plugins/volume-profile'),
        require('./plugins/quick-measure')
    ]
};
