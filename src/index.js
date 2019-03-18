/*global carto mapboxgl*/

import './../style/style.scss';
import locations from './locations.geo.json';

function addMap () {
  const map = new mapboxgl.Map({
    container: 'map',
    style: carto.basemaps.darkmatter,
    center: [0, 30],
    zoom: 2
  });

  const locationsSource = new carto.source.GeoJSON(locations);
  const viz = new carto.Viz(`
    @name: $name
  `);

  const layer = new carto.Layer('layer', locationsSource, viz);
  const interactivity = new carto.Interactivity(layer);

  interactivity.on('featureHover', featureEvent => {
    featureEvent.features.forEach((feature) => {
      const name = feature.variables.name.value;
      console.log(`:${name}:`);
    });
  });

  layer.addTo(map);
}

function autorun() {
  console.log('GoT');
  addMap();
}

if (window.addEventListener) {
  window.addEventListener('load', autorun, false);
} else if (window.attachEvent) {
  window.attachEvent('onload', autorun);
} else {
  window.onload = autorun;
}
