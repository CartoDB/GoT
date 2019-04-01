/*global carto mapboxgl*/
import locations from './locations.geo.json';
import style from './map-style.json';
import { state } from './state';

function getPlaceFromGeoJSON (place) {
  const placeId = parseInt(place.id);
  let thePlace = null;
  if (!Number.isNaN(placeId)) {
    thePlace = locations.features.reduce(function (accum, feature) {
      if (accum === null && placeId === feature.properties.id) {
        accum = feature;
      }
      return accum;
    }, null);  
  }
  return thePlace;
}

export function setupMap (onClickCb, onEnterCb, onLeaveCb) {
  mapboxgl.accessToken = 'pk.eyJ1IjoibWFtYXRhIiwiYSI6IjRJQmR3VEkifQ.U2bHbrX94_ZDOuJiRpcUvg';
  mapboxgl.config.API_URL = 'https://api.mapbox.com';

  const map = new mapboxgl.Map({
    container: 'map',
    style: style,
    hash: false,
    scrollZoom: true
  }).addControl(new mapboxgl.NavigationControl(), 'top-right');

  const locationsSource = new carto.source.GeoJSON(locations);
  state.viz = new carto.Viz(`
    @name: $name,
    @important: $important,
    strokeWidth: 0,
    color: #E82C0C,
    filter: 1
  `);

  const layer = new carto.Layer('layer', locationsSource, state.viz);
  const interactivity = new carto.Interactivity(layer);

  interactivity.on('featureClick', featureEvent => {
    if (state.inQuestion) {
      const feature = featureEvent.features[0];
      const coordinates = featureEvent.coordinates;
      const target = getPlaceFromGeoJSON(state.currentTarget);
      const basicTarget = {
        id: target.properties.id,
        lng: target.geometry.coordinates[0],
        lat: target.geometry.coordinates[1]
      };
      onClickCb(feature, coordinates, basicTarget);
    }
  });

  interactivity.on('featureEnter', featureEvent => {
    const feature = featureEvent.features[0];
    if (feature) {
      onEnterCb(feature.variables.name.value);
    }
  });

  interactivity.on('featureLeave', () => {
    onLeaveCb();
  });

  layer.addTo(map);
}

export function filterMap () {
  state.filtered = !state.filtered;
  if (state.filtered) {
    const s = carto.expressions;
    state.viz.filter = s.eq(s.prop('important'), 'true');
  } else {
    state.viz.filter = 1;
  }
}
