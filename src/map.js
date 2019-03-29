/*global carto mapboxgl*/
import locations from './locations.geo.json';
import continents from './continents.geo.json';
import rivers from './rivers.geo.json';
import roads from './roads.geo.json';
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
  const map = new mapboxgl.Map({
    container: 'map',
    style: {
      version: 8,
      name: 'oceans',
      sources: {},
      layers: [
        {
          id: 'background',
          type: 'background',
          layout: {
            visibility: 'visible'
          },
          paint: {
            'background-color': '#B5D4DE',
            'background-opacity': 1
          }
        }
      ],
      id: 'oceans',
      owner: 'The Iron Bank'
    },
    center: [30, 15],
    zoom: 4
  });

  const locationsSource = new carto.source.GeoJSON(locations);
  state.viz = new carto.Viz(`
    @name: $name,
    @important: $important,
    strokeWidth: 0,
    color: ramp(top($question, 2), [red, yellow]),
    filter: 1
  `);

  const continentsSource = new carto.source.GeoJSON(continents);
  const continentsViz = new carto.Viz(`
    strokeWidth: 0
    color: #034F50
  `);

  const riversSource = new carto.source.GeoJSON(rivers);
  const riversViz = new carto.Viz(`
    strokeWidth: 2
    color: blue
  `);

  const roadsSource = new carto.source.GeoJSON(roads);
  const roadsViz = new carto.Viz(`
    strokeWidth: 3
    color: gray
  `);

  const layer4 = new carto.Layer('layer4', roadsSource, roadsViz);
  const layer3 = new carto.Layer('layer3', riversSource, riversViz);
  const layer2 = new carto.Layer('layer2', continentsSource, continentsViz);
  const layer = new carto.Layer('layer', locationsSource, state.viz);
  const interactivity = new carto.Interactivity(layer);

  interactivity.on('featureClick', featureEvent => {
    if (state.inQuestion) {
      const feature = featureEvent.features[0];
      const coordinates = featureEvent.coordinates;
      const target = getPlaceFromGeoJSON(state.currentPlace);
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

  layer2.addTo(map);
  layer3.addTo(map);
  layer4.addTo(map);
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
