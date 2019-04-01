function onStartClicked () {
  closeWelcome();
}

function closeWelcome () {
  const welcome = document.querySelector('.welcome');
  welcome.parentNode.removeChild(welcome);
}

// This can be refactored
export function closeBottomDialog () {
  console.log('> closeBottomDialog');
  const dialogs = document.querySelectorAll('.bottom-dialog');
  dialogs.forEach(element => {
    element.parentNode.removeChild(element);
  });
}

export function showWelcome (startCb) {
  const template = document.querySelector('#welcome-template');
  const clone = document.importNode(template.content, true);
  const body = document.getElementsByTagName('body')[0];
  body.appendChild(clone);

  const startButton = document.querySelector('.welcome button');
  startButton.addEventListener('click', () => {
    onStartClicked();
    startCb();
  });
}

export function renderQuestion (question, totalQuestions) {
  const template = document.querySelector('#question-template');
  const clone = document.importNode(template.content, true);
  const questionEl = clone.querySelector('.text');
  questionEl.textContent = `${ question.index} / ${ totalQuestions } ${ question.text }`;

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
  imgEl.src = target['Image URL'];
  const buttonEl = clone.querySelector('button');
  buttonEl.addEventListener('click', nextCb);

  const body = document.getElementsByTagName('body')[0];
  body.appendChild(clone);
}

export function renderMiss (clickedPlace, distance, points, nextCb) {
  const template = document.querySelector('#miss-template');
  const clone = document.importNode(template.content, true);
  const clickedEl = clone.querySelector('.clicked');
  clickedEl.textContent = `You clicked on ${ clickedPlace }`;
  const distanceEl = clone.querySelector('.distance');
  distanceEl.textContent = `It's ${ Math.floor(distance) } kms. far from the answer.`; 
  const pointsEl = clone.querySelector('.points');
  const pointsText = points > 0
    ? `You earned ${ points } points.`
    : "You didn't earn any points."; // eslint-disable-line
  pointsEl.textContent = pointsText; 
  const buttonEl = clone.querySelector('button');
  buttonEl.addEventListener('click', nextCb);

  const body = document.getElementsByTagName('body')[0];
  body.appendChild(clone);
}

export function renderEnd (points, maxPoints, nextCb) {
  const template = document.querySelector('#end-template');
  const clone = document.importNode(template.content, true);
  const pointsEl = clone.querySelector('.points');
  pointsEl.textContent = `Your final score: ${ points } / ${ maxPoints }`; 
  const buttonEl = clone.querySelector('button');
  buttonEl.addEventListener('click', nextCb);

  const body = document.getElementsByTagName('body')[0];
  body.appendChild(clone);
}