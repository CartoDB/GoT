import './../style/style.scss';
import { getDistanceFromLngLatInKm, calculateScore } from './utils';
import { state } from './state';
import { setupMap, filterMap } from './map';
import { getQuestion, fillQuestions } from './questions';
import { showWelcome, renderQuestion, closeBottomDialog, renderHit, renderMiss, renderEnd } from './ui';
import { getCharacterFromScore } from './score';

const maxQuestions = 5;
const maxPoints = 100;

function setFilterButtonText () {
  const button = document.getElementById('filter-button');
  state.filtered
    ? button.textContent = 'Reset'
    : button.textContent = 'Filter';
}
function addFilterEvent () {
  const button = document.getElementById('filter-button');
  button.addEventListener('click', function () {
    filterMap();
    setFilterButtonText();
  });
}

function hookUpEvents () {
  addFilterEvent();
}

function onNext () {
  state.currentIndex++;
  closeBottomDialog();
  if (state.currentIndex < maxQuestions) {
    state.inQuestion = true;
    renderQuestion(getQuestion(), maxQuestions);
  } else {
    const maxScore = maxPoints * maxQuestions;
    renderEnd(state.totalScore, maxScore, getCharacterFromScore(state.totalScore, maxScore), onRestart);
  }  
}

function onRestart () {
  startState();
}

function featureClicked (feature, coordinates, target) {
  if (feature) {
    state.inQuestion = false;
    const clickedId = feature.id;
    let score = 0;
    closeBottomDialog();
    if (clickedId === target.id) {
      score = calculateScore(0, maxPoints);
      renderHit(score, state.currentTarget, onNext);
    } else {
      const distance = Math.floor(getDistanceFromLngLatInKm({
        lng: target.lng,
        lat: target.lat,
      }, coordinates));
      score = calculateScore(distance, maxPoints);
      renderMiss(feature.variables.name.value, distance, score, onNext);
    }
    state.totalScore += score;
  }
}

function setTooltip (text) {
  const tooltip = document.getElementById('tooltip-text');
  tooltip.textContent = text;
  text
    ? tooltip.classList.remove('hidden')
    : tooltip.classList.add('hidden');
}

function featureEntered (name) {
  setTooltip(name);
}

function featureLeft () {
  setTooltip('');
}

function onStart () {
  state.inQuestion = true;
  closeBottomDialog();
  renderQuestion(getQuestion(), maxQuestions);
}

function startState (showWelcomeDialog) {
  state.currentIndex = 0;
  state.indexes = null;
  state.inQuestion = false;
  state.currentTarget = null;
  state.totalScore = 0;

  fillQuestions(maxQuestions);

  if (showWelcomeDialog) {
    showWelcome(onStart);
  } else {
    onStart();
  }
}

function gameLoop() {
  setupMap(featureClicked, featureEntered, featureLeft);
  hookUpEvents();
  filterMap();
  setFilterButtonText();
  startState(true);
}

if (window.addEventListener) {
  window.addEventListener('load', gameLoop, false);
} else if (window.attachEvent) {
  window.attachEvent('onload', gameLoop);
} else {
  window.onload = gameLoop;
}
