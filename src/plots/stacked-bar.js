const StackedBar = {
    name: 'stacked-bar',
    title: 'Stacked Bar',
    trackable: false,
    parameters: {
        stroke: {
            title: 'Stroke Color',
            type: 'color',
            default: '#0000FF'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        },
        track: {
            title: 'Track Value',
            type: 'boolean',
            default: false
        },
        width: {
            title: 'Stroke Width',
            type: 'number',
            enum: [1, 1.5, 2, 2.5],
            default: 1.5
        },
        style: {
            title: 'Stroke Style',
            type: 'string',
            enum: ['solid', 'dashed', 'dotted'],
            default: 'solid'
        }
    },
    render: ({chart, panel, element, data, parameters}) => {
        if(data){
            const cumulative = data.map(array => {
                let sum = 0;
                return array.map(value => sum += value);
            });

            const groups = element.selectAll('g').data(cumulative.array());

            groups.enter().append('g');
            groups.exit().remove();

            const bars = groups.selectAll('rect').data(d => d);

            bars.enter()
                .append('rect')
                .merge(bars)
                    .attr('width', d => this.scale(d.buy))
                    .attr('height', height)
                    .attr('y', d => Math.floor(this.panel.scale(d.level)))
                    .attr('x', d => this.panel.width - this.scale(d.buy) - this.scale(d.sell));

            bars.exit().remove();
        }else{
            element.selectAll('g').remove();
        }
    }
};

module.exports = StackedBar;
