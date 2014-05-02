/**
 * Created by artzub on 28.04.2014.
 */

L.Control.SearchCleint = L.Control.extend({
    options : {
        position : 'topleft',
        title: 'Search',
        keepOpen : false
    },

    onAdd : function(map) {
        var bar = L.DomUtil.create('div', 'leaflet-control-search' +
            (this.options.keepOpen ? ' open' : '') +
            ' leaflet-bar leaflet-control');

        var item = L.DomUtil.create('a', 'oi leaflet-bar-part', bar);
        item.href = "#";
        item.title = this.options.title;

        L.DomEvent
            .on(item, 'click', L.DomEvent.stopPropagation)
            .on(item, 'click', L.DomEvent.preventDefault)
            .on(item, 'dbclick', L.DomEvent.stopPropagation)
        ;

        d3.select(item)
            .attr("data-glyph", "magnifying-glass")
            .attr("aria-hidden", "true")
        ;

        this.bar = d3.select(bar);

        this._search = this.bar.append('a').append('input')
            .attr('type', 'text')
        ;

        /*this.settingContainer = this.bar.append('div')
            .attr('class', 'leaflet-control-settings-container');*/


        this.bar.hide = function() {
            this.style('display', 'none');
        };
        this.bar.show = function() {
            this.style('display', null);
        };

        return bar;
    }
});

L.control.searchClient = function (options) {
    return new L.Control.SearchCleint(options);
};