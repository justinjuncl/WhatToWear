'use strict';

let Wit = require('node-wit').Wit;
let interactive = require('node-wit').interactive;

const accessToken = 'N5Z57AGCO7ZCDPLBITQL7Z3TFYZ67HND';
const maxSteps = 10;

var getJSON = function (url) {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  })
  .then(rsp => {
    var res = rsp.json();
    return res;
  })
  .then(json => {
    if (json.error && json.error.message) {
      throw new Error(json.error.message);
    }
    return json;
  });
}

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    console.log('Bot: ', text);
  },
  getDateTime({context, entities}) {
    return new Promise(function(resolve, reject) {
      context.datetime = firstEntityValue(entities, 'datetime');
      return resolve(context);
    });
  },
  getGender({context, entities}) {
    return new Promise(function(resolve, reject) {
      context.gender = firstEntityValue(entities, 'gender');
      return resolve(context);
    });
  },
  getClothes({context, entities}) {
    console.log('entities', entities)
    console.log('context', context)
    var gender = context.gender;
    var location = firstEntityValue(entities, 'location');

    return new Promise(function (resolve, reject) {
      let url = 'http://api.openweathermap.org/data/2.5/weather?q=' + location + '&appid=ff14898593d8b6c0b8e271199189269d'
      return getJSON(url).then(jsonData => {
        context.top = '___';
        context.bottom = '___';
        context.shoes = '___';
        context.extra = '___';
        context.weather = jsonData.weather[0].description;
        context.location = jsonData.name;
        return resolve(context);
      })
    });
  },
};

const client = new Wit({accessToken, actions});

interactive(client);
