module.exports = ({chart, panel, element, data, parameters}) => {
    const [start, end] = data;
    // console.log(parameters)
    //TODO handle properties like color / width
    element.select('path').remove();
    element.append('path').attr('d', `M ${start} 0 v ${panel.height} H ${end} v ${-panel.height} Z`);
};