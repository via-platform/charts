const Plots = {
    'line': require('./line'),
    'area': require('./area'),
    'mountain': require('./mountain'),
    'histogram': require('./histogram'),
    'step': require('./step'),
    'cross': require('./cross'),
    'column': require('./column'),
    'circle': require('./circle')
};

module.exports = configuration => {
    if(!configuration.element.classed(configuration.parameters.style.value)){
        configuration.element.attr('class', `plot ${configuration.parameters.style.value}`).selectAll('*').remove();
    }

    Plots[configuration.parameters.style.value](configuration);
};