/*global carto mapboxgl*/
import { isMobile } from 'is-mobile';
import locations from './locations.geo.json';
import style from './map-style.json';
import { state } from './state';

function getPlaceFromGeoJSON (id) {
  const placeId = parseInt(id);
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

export function setupMap (onClickCb) {
  state.map = new mapboxgl.Map({
    container: 'map',
    style: style,
    hash: false,
    scrollZoom: true,
    center: [20.757130, 4.235433],
    zoom: 4
  }).addControl(new mapboxgl.NavigationControl(), 'top-right');

  const locationsSource = new carto.source.GeoJSON(locations);

  const width = isMobile()
    ? '16'
    : '8';

  state.viz = new carto.Viz(`
    @name: $name
    @important: $important

    strokeColor: opacity(gold, 0.8)
    color: opacity(gold, 0.4)
    strokeWidth: 1
    filter: 1
    width: ${ width }
  `);

  const layer = new carto.Layer('layer', locationsSource, state.viz);
  const interactivity = new carto.Interactivity(layer);

  handleInteractivity(interactivity, onClickCb);

  state.line = getLineGeoJSON();
  state.lineSource = new carto.source.GeoJSON(state.line);
  state.lineViz = new carto.Viz(`
    color: opacity(#d700ff, 0.7)
    width: 4
  `);
  state.lineLayer = new carto.Layer('lineLayer', state.lineSource, state.lineViz);
  state.lineLayer.addTo(state.map);
  layer.addTo(state.map, 'selected-places-got');
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

function getLineGeoJSON () {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[-50,-50], [-51, -51]]
        }
      }
    ]
  };
}

function easeInOutQuad (t) {
  return t < .5
    ? 2*t*t
    : -1 + (4-2*t)*t;
}

export function showPath (start, end) {
  let time = Date.now();
  const totalMsecs = 1000;
  const deltaLng = end.lng - start.lng;
  const deltaLat = end.lat -start.lat;
  state.line.features[0].geometry.coordinates[0][0] = start.lng;
  state.line.features[0].geometry.coordinates[0][1] = start.lat;
  const intervalId = setInterval(() => {
    const diff = Date.now() - time;
    const progress = easeInOutQuad(diff/totalMsecs);
    state.line.features[0].geometry.coordinates[1][0] = start.lng + progress * deltaLng;
    state.line.features[0].geometry.coordinates[1][1] = start.lat + progress * deltaLat;
    if (diff > totalMsecs) {
      clearInterval(intervalId);
      state.line.features[0].geometry.coordinates[1][0] = end.lng;
      state.line.features[0].geometry.coordinates[1][1] = end.lat;
    }
    state.lineLayer.update(state.lineSource, state.lineViz);
    state.lineLayer.show();
  }, 17);
  fitToBounds(start, end);
}

function fitToBounds (start, end) {
  let options = {
    padding: 200,
    duration: 1000,
    maxZoom: 4,
    linear: true
  };

  if (isMobile()) {
    options.padding = 32;
  }

  state.map.fitBounds([[
    start.lng,
    start.lat
  ],[
    end.lng,
    end.lat
  ]], options);
}

export function resetZoom () {
  const currentZoom = state.map.getZoom();
  if (currentZoom < 4) {
    state.map.zoomTo(4);
  } else if (currentZoom > 5) {
    state.map.zoomTo(5);
  }
}

export function hidePath () {
  state.lineLayer.hide();
}

function handleInteractivity (interactivity, onClickCb) {
  const delay = 50;

  interactivity.on('featureClick', featureEvent => {
    if (state.inQuestion && featureEvent && featureEvent.features.length > 0) {
      const feature = featureEvent.features[0];
      state.clickedFeatureId = feature.id;
      state.clickedFeature = feature;
      feature.color.blendTo('gold', delay);
      feature.strokeWidth.blendTo('6', delay);
      feature.strokeColor.blendTo('gold', delay);
      const origin = getPlaceFromGeoJSON(state.clickedFeatureId);
      const coordinates = origin.geometry.coordinates;
      const target = getPlaceFromGeoJSON(state.currentTarget.id);
      const basicTarget = {
        id: target.properties.id,
        lng: target.geometry.coordinates[0],
        lat: target.geometry.coordinates[1],
        name: target.properties.name
      };
      onClickCb(feature, coordinates, basicTarget);
    }
  });

  interactivity.on('featureClickOut', event => {
    if (event.features.length) {
      event.features.forEach(feature => resetClick(feature));
    }
  });

  interactivity.on('featureEnter', event => {
    event.features.forEach(feature => {
      if (feature.id !== state.clickedFeatureId) {
        feature.color.blendTo('opacity(#d700ff, 0.8)', delay);
        feature.strokeWidth.blendTo('4', delay);
        feature.strokeColor.blendTo('opacity(#d700ff, 1)', delay);
      }
    });
  });

  interactivity.on('featureLeave', event => {
    event.features.forEach(feature => {
      if (feature.id !== state.clickedFeatureId) {
        feature.color.reset(delay);
        feature.strokeWidth.reset(delay);
        feature.strokeColor.reset(delay);
      }
    });
  });
}

export function resetClick (feature) {
  if (!feature) {
    return;
  }

  const delay = 50;
  if (feature.id === state.clickedFeatureId) {
    state.clickedFeatureId = null;
    state.clickedFeature = null;
    feature.color.reset(delay);
    feature.strokeWidth.reset(delay);
    feature.strokeColor.reset(delay);
  }
}
