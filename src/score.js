import ranking from './ranking.json';

function getScoreRanges (maxPoints) {
  const characters = ranking.length;
  const step = Math.ceil(maxPoints / (characters - 1));
  const values = [0];
  let value = -1;
  for (let i = 0; i < characters - 1; i++) {
    value += step + 1;
    if (value >= maxPoints) {
      value = maxPoints;
    }
    values.push(value);
  }
  return values;
}

export function getCharacterFromScore (score, maxPoints) {
  const ranges = getScoreRanges(maxPoints);
  const characters = ranking.length;
  let position = 0;
  for (let i = 0; i < characters; i++) {
    if (score >= ranges[i]) {
      position = i;
    }
  }
  return ranking[position];
}