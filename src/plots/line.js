module.exports = ({chart, panel, element, data, parameters}) => {
    // console.log(parameters)
    //TODO handle properties like color / width
    element.select('path').remove();

    if(typeof data === 'number'){
        console.log(data);
    }else{
        element.append('path').classed('stroke', true).datum(data).attr('d', d => d.length > 1 ? 'M ' + d.map(([x, y]) => `${chart.scale(x)} ${panel.scale(y)}`).join(' L ') : '');
    }
};