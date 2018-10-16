# Events

* On initialize, subscribe to the market candles, calculate all layers, and draw all layers.
* On market candles update, calculate all layers and draw all layers.
* On chart move / zoom, request new data and draw all layers.
* On market change, subscribe to new market, calculate all layers, and draw all layers.
* On granularity change, subscribe to new granularity, calculate all layers, and draw all layers.


# Important things to know:

* Axis width due to decimal precision
* Panel domain / scale
* Let a panel know when a layer has recalculated
* Rescale a panel when a parameter has updated