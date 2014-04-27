/**
 * Created by artzub on 27.04.2014.
 */

L.Control.Settings = L.Control.extend({
    options : {
        position : 'topleft',
        title : 'Параметры',
        keepOpen : false
    },

    onAdd : function(map) {
        var bar = L.DomUtil.create('div', 'leaflet-control-settings' +
            (this.options.keepOpen ? ' open' : '') +
            ' leaflet-bar leaflet-control');

        var item = L.DomUtil.create('a', 'oi leaflet-bar-part leaflet-control-settings-cog', bar);
        item.href = "#";
        item.title = this.options.title;

        L.DomEvent
            .on(item, 'click', L.DomEvent.stopPropagation)
            .on(item, 'click', L.DomEvent.preventDefault)
            .on(item, 'dbclick', L.DomEvent.stopPropagation)
        ;

        d3.select(item)
            .attr("data-glyph", "cog")
            .attr("aria-hidden", "true")
        ;

        this.bar = d3.select(bar);

        this.settingContainer = this.bar.append('div')
            .attr('class', 'leaflet-control-settings-container');


        this.bar.hide = function() {
            this.style('display', 'none');
        };
        this.bar.show = function() {
            this.style('display', null);
        };

        return bar;
    }
});

L.control.settings = function (options) {
    return new L.Control.Settings(options);
};