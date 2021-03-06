/*global carto*/
import { isMobile } from 'is-mobile';
import { getDistanceFromLngLatInKm, calculateScore } from './utils';
import { state } from './state';
import { setupMap, filterMap, showPath, hidePath, resetClick, resetZoom } from './map';
import { getQuestion, fillQuestions } from './questions';
import { showWelcome, renderQuestion, closeBottomDialog, renderHit, renderMiss, renderEnd, renderError } from './ui';
import { getCharacterFromScore } from './score';


const maxQuestions = 5;
const maxPoints = 100;

function onNext () {
  state.currentIndex++;
  closeBottomDialog();
  hidePath();
  resetClick(state.clickedFeature);
  resetZoom();
  const maxScore = maxPoints * maxQuestions;
  if (state.currentIndex < maxQuestions) {
    state.inQuestion = true;
    renderQuestion(getQuestion(), state.currentTarget, maxQuestions, state.totalScore, maxScore);
  } else {
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
      }, { lng: coordinates[0], lat: coordinates[1] }));
      score = calculateScore(distance, maxPoints);
      renderMiss(feature.variables.name.value, target.name, distance, score, onNext);
      showPath({ lng: coordinates[0], lat: coordinates[1] }, { lng: target.lng, lat: target.lat });
    }
    state.totalScore += score;
  }
}

function onStart () {
  state.inQuestion = true;
  closeBottomDialog();
  renderQuestion(getQuestion(), state.currentTarget, maxQuestions, state.totalScore, maxPoints * maxQuestions);
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

function checkBrowser() {
  if (!carto.isBrowserSupported()) {
    const reasons = carto.unsupportedBrowserReasons();
    const message = reasons.map(r => r.message).join(' - ');
    if (window.dataLayer) {
      window.dataLayer.push('event', 'vl-error', message);
    }
    renderError(isMobile());
    return false;
  }
  return true;
}

function gameLoop() {
  window.state = state;
  if (checkBrowser()) {
    setupMap(featureClicked);
    filterMap();
    startState(true);  
  }
}

if (window.addEventListener) {
  window.addEventListener('load', gameLoop, false);
} else if (window.attachEvent) {
  window.attachEvent('onload', gameLoop);
} else {
  window.onload = gameLoop;
}
