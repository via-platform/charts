module.exports = class RSI {
    static metadata(){
        return {
            name: 'rsi',
            type: 'indicator',
            title: 'Relative Strength Index',
            description: 'A momentum oscillator that measures the speed and change of price movements.'
        }
    }

    describe(){
        return {
            components: {
                rsi: 'plot',
                upper_limit: 'line',
                lower_limit: 'line',
                limit_range: 'fill'
            },
            params: {
                length: {
                    title: 'Length',
                    type: 'number',
                    constraint: x => x => 0 && x <= 100,
                    default: 14
                },
                upper_limit: {
                    title: 'Upper Limit',
                    type: 'integer',
                    constraint: x => x => 0 && x <= 100,
                    default: 70
                },
                lower_limit: {
                    title: 'Lower Limit',
                    type: 'integer',
                    constraint: x => x => 0 && x <= 100,
                    default: 30
                }
            }
        };
    }

    calculate(vs){
        vs.fill({id: 'limit_range', value: [vs.param('upper_limit'), vs.param('lower_limit')]});
        vs.plot({id: 'upper_limit', value: vs.param('upper_limit')});
        vs.plot({id: 'lower_limit', value: vs.param('lower_limit')});
        vs.plot({id: 'rsi', value: vs.rsi(vs.param('length'))});
    }
}

// this.values = [];
//
// data.reduce((accumulator, candle, index) => {
//     const gain = Math.max(candle.price_close - candle.price_open, 0);
//     const loss = Math.max(candle.price_open - candle.price_close, 0);
//     let ag, al;
//
//     if(index < this.periods - 1){
//         return {gain: accumulator.gain + gain, loss: accumulator.loss + loss};
//     }else if(index === this.periods - 1){
//         ag = (accumulator.gain + gain) / this.periods;
//         al = (accumulator.loss + loss) / this.periods;
//     }else{
//         ag = ((this.periods - 1) * accumulator.gain + gain) / this.periods;
//         al = ((this.periods - 1) * accumulator.loss + loss) / this.periods;
//     }
//
//     this.values.push({time_period_start: new Date(candle.time_period_start), value: 100 - (100 / (1 + (ag / al)))});
//
//     return {gain: ag, loss: al};
// }, {gain: 0, loss: 0});