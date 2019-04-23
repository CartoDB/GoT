function onStartClicked () {
  closeWelcome();
}

function closeWelcome () {
  const welcome = document.querySelector('.welcome');
  welcome.parentNode.removeChild(welcome);
}

function renderBold (el, text, bold) {
  const text0 = document.createTextNode(text);
  const b = document.createElement('b');
  const text1 = document.createTextNode(bold);
  el.appendChild(text0);
  el.appendChild(b);
  b.appendChild(text1);
}

function renderMissPlaces (el, target, clicked) {
  const text0 = document.createTextNode('It was ');
  const b0 = document.createElement('b');
  const targetText = document.createTextNode(target);
  const text1 = document.createTextNode(' but you clicked on ');
  const b1 = document.createElement('b');
  const clickedText = document.createTextNode(clicked);
  el.appendChild(text0);
  el.appendChild(b0);
  b0.appendChild(targetText);
  el.appendChild(text1);
  el.appendChild(b1);
  b1.appendChild(clickedText);
}

export function closeBottomDialog () {
  const dialogs = document.querySelectorAll('.bottom-dialog, .end-dialog');
  dialogs.forEach(element => {
    element.parentNode.removeChild(element);
  });
}

export function showWelcome (startCb) {
  const template = document.querySelector('#welcome-template');
  const clone = document.importNode(template.content, true);
  const body = document.getElementsByTagName('body')[0];
  body.appendChild(clone);

  const startButton = document.querySelector('.welcome .button');
  startButton.addEventListener('click', () => {
    onStartClicked();
    startCb();
  });
}

export function renderQuestion (question, target, totalQuestions, score, maxScore) {
  const template = document.querySelector('#question-template');
  const clone = document.importNode(template.content, true);
  const numberEl = clone.querySelector('.number');
  numberEl.textContent = `${ question.index} / ${ totalQuestions }`; 
  const questionEl = clone.querySelector('.text');
  questionEl.textContent = `${ question.text }`;
  const scoreEl = clone.querySelector('.score');
  renderBold (scoreEl, 'SCORE:', `${score}/${maxScore}`);
  const preloadEl = document.getElementById('preload');
  preloadEl.src = `/places/${ target['Image URL'] }`;

  const body = document.getElementsByTagName('body')[0];
  body.appendChild(clone);
}

export function renderHit (points, target, nextCb) {
  const template = document.querySelector('#hit-template');
  const clone = document.importNode(template.content, true);
  const pointsEl = clone.querySelector('.points');
  pointsEl.textContent = `You earned ${ points } points.`; 
  const placeEl = clone.querySelector('.place');
  placeEl.textContent = target.Name;
  const imgEl = clone.querySelector('img');
  imgEl.src = `/places/${ target['Image URL'] }`;
  const linkEl = clone.querySelector('.caption');
  linkEl.href = target.Link;
  linkEl.textContent = target.Caption;
  const buttonEl = clone.querySelector('button');
  buttonEl.addEventListener('click', nextCb);

  const body = document.getElementsByTagName('body')[0];
  body.appendChild(clone);
}

export function renderMiss (clickedPlace, targetName, distance, points, nextCb) {
  const template = document.querySelector('#miss-template');
  const clone = document.importNode(template.content, true);
  const clickedEl = clone.querySelector('.clicked');
  renderMissPlaces(clickedEl, targetName, clickedPlace);
  const pointsEl = clone.querySelector('.points');
  const pointsText = points > 0
    ? `You earned ${ points } points.`
    : 'You didn\'t earn any points.';
  pointsEl.textContent = pointsText; 
  const buttonEl = clone.querySelector('button');
  buttonEl.addEventListener('click', nextCb);

  const body = document.getElementsByTagName('body')[0];
  body.appendChild(clone);
}

export function renderEnd (points, maxPoints, character, nextCb) {
  const template = document.querySelector('#end-template');
  const clone = document.importNode(template.content, true);
  const pointsEl = clone.querySelector('.points');
  pointsEl.textContent = `Your final score: ${ points }/${ maxPoints }`; 
  const buttonEl = clone.querySelector('button');
  buttonEl.addEventListener('click', nextCb);
  const characterNameEl = clone.querySelector('.character-name');
  characterNameEl.textContent = character.name;
  const characterMessageEl = clone.querySelector('.character-message');
  const paragraphs = character.message.split('\n');

  const imgEl = document.createElement('img');
  imgEl.src = character.image;
  characterMessageEl.appendChild(imgEl);
  paragraphs.forEach(sentence => {
    const p = document.createElement('p');
    p.textContent = sentence;
    characterMessageEl.appendChild(p);
  });

  const body = document.getElementsByTagName('body')[0];
  body.appendChild(clone);
}