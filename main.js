'use strict';

let Wit = require('node-wit').Wit;
let interactive = require('node-wit').interactive;

const accessToken = '5RKXBBAR7JJ32XCRNO6WTYWCGTWOQH4D';

var getJSON = function (location) {
  var url = 'https://restcountries.eu/rest/v2/name/' + location;
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
    console.log('sending...', JSON.stringify(response));
  },
  getCapital({context, entities}) {
    var location = firstEntityValue(entities, 'location');
    if (location) {
      return new Promise(function (resolve, reject) {
        return getJSON(location).then(jsonData => {
          context.capital = jsonData[0].capital;
          delete context.missingLocation;
          return resolve(context);
        })
      });
    } else {
      context.missingLocation = true;
      delete context.capital;
      return Promise.reject(context);
    }
    return context;
  },
};

const client = new Wit({accessToken, actions});

interactive(client);
