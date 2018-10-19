module.exports = ({chart, panel, element, data, parameters}) => {
    // console.log(parameters)
    //TODO handle properties like color / width
    element.select('path').remove();
    element.append('path').attr('d', `M ${data} 0 v ${panel.height}`);
};