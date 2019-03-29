import './../style/style.scss';
import { getDistanceFromLngLatInKm, calculateScore } from './utils';
import { state } from './state';
import { setupMap, filterMap } from './map';
import { askQuestion, fillQuestions } from './questions';

const sidebar = document.getElementsByTagName('sidebar')[0];
const maxQuestions = 5;

function log (text) {
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  sidebar.appendChild(paragraph);
}

function addFilterEvent () {
  const button = document.getElementById('filter-button');
  button.addEventListener('click', function () {
    filterMap();
    state.filtered
      ? button.textContent = 'Reset'
      : button.textContent = 'Filter';
  });
}

function hookUpEvents () {
  addFilterEvent();
}

function featureClicked (feature, coordinates, target) {
  if (feature) {
    const clickedId = feature.id;
    if (clickedId === target.id) {
      const score = calculateScore(0);
      state.totalScore += score;
      log(`YEAH! You nailed it! You earned ${ score } points.`);
      log('');
    } else {
      const distance = getDistanceFromLngLatInKm({
        lng: target.lng,
        lat: target.lat,
      }, coordinates);
      const distanceText = ` It's ${ Math.floor(distance) } kms. far from the answer.`;
      const score = calculateScore(distance);
      log(`FAIL! You clicked on ${ feature.variables.name.value }.${ distanceText }`);
      if (score === 0) {
        log("You didn't earn any points."); // eslint-disable-line
      } else {
        state.totalScore += score;
        log(`You earned ${ score } points.`);
      }
      log('');
    }
    state.currentIndex++;
    if (state.currentIndex < maxQuestions) {
      log(askQuestion());
    } else {
      log(`Your score: ${ state.totalScore }/1000`);
    }  
  }
}

function setTooltip (text) {
  const tooltip = document.getElementById('tooltip-text');
  tooltip.textContent = text;
}

function featureEntered (name) {
  setTooltip(name);
}

function featureLeft () {
  setTooltip('');
}

function gameLoop() {
  log('GoT');
  setupMap(featureClicked, featureEntered, featureLeft);
  hookUpEvents();
  fillQuestions(10);
  log(askQuestion());
}

if (window.addEventListener) {
  window.addEventListener('load', gameLoop, false);
} else if (window.attachEvent) {
  window.attachEvent('onload', gameLoop);
} else {
  window.onload = gameLoop;
}
