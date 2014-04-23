/**
 * Created by artzub on 24.04.2014.
 */

L.Control.ResetZoomControl = L.Control.extend({
    options : {
        position : 'topleft',
        center : null,
        zoom : null,
        strings : {
            reset : 'Reset view'
        }
    },

    setCenter : function(center) {
       this.options.center = center || this.map.getCenter();
    },

    setZoom : function(zoom) {
        this.options.zoom = zoom || this.map.getZoom();
    },

    onAdd : function(map) {
        this.map = map;

        this.setCenter(this.options.center);
        this.setZoom(this.options.zoom);

        var self = this;
        var bar = L.DomUtil.create('div', 'leaflet-control-resetzoom leaflet-bar leaflet-control');

        var item = L.DomUtil.create('a', 'oi leaflet-bar-part', bar);
        item.href = "#";
        item.title = this.options.strings.reset;

        L.DomEvent
            .on(item, 'click', L.DomEvent.stopPropagation)
            .on(item, 'click', L.DomEvent.preventDefault)
            .on(item, 'click', function() {
                var center = self.options.center
                    , zoom = self.options.zoom || 3
                    , type = "fullscreen-enter"

                    , curCenter = self.map.getCenter()
                    , curZoom = self.map.getZoom()

                    ;

                if (self.lastState) {
                    center = self.lastState.center;
                    zoom = self.lastState.zoom;
                    delete self.lastState;
                }
                else {
                    type = "fullscreen-exit";
                    self.lastState = {
                        center : curCenter,
                        zoom : curZoom
                    };
                }

                if (curCenter.lat === center.lat
                    && curCenter.lng === center.lng
                    && curZoom === zoom)
                    return;

                map.off('viewreset', clearState)
                    .off('dragend', clearState);

                map.on('viewreset', safeZoom)
                    .on('dragend', safeZoom);

                center &&
                    self.map.setView(center, zoom);
                item.attr("data-glyph", type);

            })
            .on(item, 'dbclick', L.DomEvent.stopPropagation)
        ;

        item = d3.select(item)
            .attr("data-glyph", "fullscreen-enter")
            .attr("aria-hidden", "true")
        ;

        var safeZoom = function() {
            map.off('viewreset', safeZoom)
                .off('dragend', safeZoom)
            ;

            map.on('viewreset', clearState)
                .on('dragend', clearState)
            ;
        };

        var clearState = function() {
            delete self.lastState;
            item.attr("data-glyph", "fullscreen-enter");
        };

        map.on('viewreset', clearState)
            .on('dragend', clearState)
        ;

        return bar;
    }
});

L.control.resetZoom = function (options) {
    return new L.Control.ResetZoomControl(options);
};