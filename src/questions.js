import { state } from './state';
import * as trivia from './../trivia/trivia.json';

function getRandomInt (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getQuestionFromIndex (index) {
  const [ placeIndex, questionIndex ] = index.split(':');
  const place = trivia[parseInt(placeIndex)];
  const question = place[`Trivia ${questionIndex.trim()}`];
  return question;
}

function getRandomQuestionIndex () {
  const length = Object.keys(trivia).length - 1;
  const randomIndex = getRandomInt(0, length);
  const questionIndex = getRandomInt(1, 4);
  return `${ randomIndex }: ${ questionIndex }`;
}

function getPlaceFromIndex (index) {
  const [ placeIndex ] = index.split(':');
  const place = trivia[parseInt(placeIndex)];
  return place;
}

export function fillQuestions (max) {
  const idxs = [];
  while (idxs.length < max) {
    let index = getRandomQuestionIndex();
    if (idxs.indexOf(index) > -1) {
      index = getRandomQuestionIndex();
    }
    if (getQuestionFromIndex(index)) {
      idxs.push(index);
    }
  }
  state.indexes = idxs;
}

export function askQuestion () {
  const question = getQuestionFromIndex(state.indexes[state.currentIndex]);
  state.inQuestion = true;
  state.currentPlace = getPlaceFromIndex(state.indexes[state.currentIndex]);
  return `${ state.currentIndex + 1 }/10: ${ question }`; 
}

