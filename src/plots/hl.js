module.exports = ({chart, panel, element, data, parameters}) => {
    // console.log(parameters)
    console.log('hl', data)
    //TODO handle properties like color / width
    element.select('path').remove();
    element.append('path').attr('d', `M 0 ${data} h ${panel.width}`);
};