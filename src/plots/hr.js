module.exports = ({chart, panel, element, data, parameters}) => {
    const [start, end] = data;
    // console.log(parameters)
    //TODO handle properties like color / width
    element.select('path').remove();
    element.append('path').attr('d', `M 0 ${start} h ${panel.width} V ${end} h ${-panel.width} Z`);
};