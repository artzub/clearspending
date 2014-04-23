/**
 * Created by artzub on 23.04.2014.
 */

L.Control.ActionConsoleControl = L.Control.extend({
    options : {
        position : 'topleft',
        strings : {
            play : 'Play',
            stop : 'Stop',
            pause : 'Pause',
            repeat : 'Repeat'
        },
        keepOpen : false
    },

    onAdd : function(map) {
        var bar = L.DomUtil.create('div', 'leaflet-control-actionconsole' +
            (this.options.keepOpen ? ' open' : '') +
            ' leaflet-bar leaflet-control');

        var buttons = {}
            , buttonsType = [
                {class : 'play', title : this.options.strings.play},
                {class : 'pause', title : this.options.strings.pause},
                {class : 'stop', title : this.options.strings.stop},
                {class : 'repeat', title : this.options.strings.repeat}
            ]
            ;

        buttonsType.forEach(function(d) {
            var item = L.DomUtil.create('a', 'oi leaflet-bar-part leaflet-control-actionconsole-' + d.class, bar);
            item.href = "#";
            item.title = d.title;

            L.DomEvent
                .on(item, 'click', L.DomEvent.stopPropagation)
                .on(item, 'click', L.DomEvent.preventDefault)
                .on(item, 'dbclick', L.DomEvent.stopPropagation)
            ;

            buttons[d.class] = d3.select(item)
                .attr("data-glyph", "media-" + d.class)
                .attr("aria-hidden", "true")
            ;

            buttons[d.class].hide = function() {
                this.style('display', 'none');
            };

            buttons[d.class].show = function() {
                this.style('display', null);
            };
        });

        buttons.play.show();
        buttons.stop.show();
        buttons.pause.show();
        buttons.repeat.hide();

        this.buttons = buttons;
        this.bar = d3.select(bar);
        this.bar.hide = function() {
            this.style('display', 'none');
        };
        this.bar.show = function() {
            this.style('display', null);
        };

        return bar;
    }
});

L.control.actionConsole = function (options) {
    return new L.Control.ActionConsoleControl(options);
};
