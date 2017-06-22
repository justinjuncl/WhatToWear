'use strict'

let Wit = require('node-wit').Wit
let interactive = require('node-wit').interactive

const accessToken = 'N5Z57AGCO7ZCDPLBITQL7Z3TFYZ67HND'
const maxSteps = 10

var getJSON = function (url) {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  })
  .then(rsp => {
    var res = rsp.json()
    return res
  })
  .then(json => {
    if (json.error && json.error.message) {
      throw new Error(json.error.message)
    }
    return json
  })
}

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  
  if (!val) {
    return null
  }
  return typeof val === 'object' ? val.value : val
}

const randomFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

const generateClothing = (temp, id, gender) => {
  let isPrecipitating = (200 <= id && id < 700)
  let isClear = (800 <= id && id < 900)

  var tops = []
  var bottoms = []
  var shoes = []
  var extras = []

  if (isPrecipitating) {
    tops = tops.concat(['long sleeves ($20)', 'coat ($100)' ])
    bottoms = bottoms.concat(['jeans ($10)'])
    shoes = shoes.concat(['boots ($50)'])
    extras = extras.concat(['umbrella ($10)'])
  }
  if (isClear) {
    tops = tops.concat(['jacket ($70)'])
    bottoms = bottoms.concat(['boxer pants ($30)'])
    shoes = shoes.concat(['sandals ($20)'])
    extras = extras.concat(['sunglasses ($20)', 'hat ($15)'])
  }
  if (temp >= 288) { // 288 Kelvin == 15 Celsius
    tops = tops.concat(['checkered shirt ($10)'])
    bottoms = bottoms.concat(['short jeans ($15)'])
    shoes = shoes.concat(['flip flops ($20)'])
    extras = extras.concat([''])
  }
  if (gender == 'Male') {
    tops = tops.concat(['sleeveless shirt ($20)'])
    bottoms = bottoms.concat(['short pants ($10)'])
    shoes = shoes.concat(['sneakers ($50)'])
    extras = extras.concat(['cap ($15)'])
  } else {
    tops = tops.concat(['blouse ($20)', 'linen t-shirt ($15)'])
    bottoms = bottoms.concat(['denim pants ($18)', 'long skirt ($22)'])
    shoes = shoes.concat(['sneakers ($50)'])
    extras = extras.concat(['bracelet ($20)'])
  }

  return [tops, bottoms, shoes, extras]
}

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request
    const {text, quickreplies} = response
    console.log('Bot: ', text)
  },
  getDateTime({context, entities}) {
    return new Promise(function(resolve, reject) {
      context.datetime = firstEntityValue(entities, 'datetime')
      return resolve(context)
    })
  },
  getGender({context, entities}) {
    return new Promise(function(resolve, reject) {
      context.gender = firstEntityValue(entities, 'gender')
      return resolve(context)
    })
  },
  getClothes({context, entities}) {
    var gender = context.gender
    var location = firstEntityValue(entities, 'location')

    return new Promise(function (resolve, reject) {
      let url = 'http://api.openweathermap.org/data/2.5/weather?q=' + location + '&appid=ff14898593d8b6c0b8e271199189269d'

      return getJSON(url).then(jsonData => {
        let temp = jsonData.weather[0].temp
        let id = jsonData.weather[0].id

        let [tops, bottoms, shoes, extras] = generateClothing(temp, id, gender)

        context.top = randomFromArray(tops)
        context.bottom = randomFromArray(bottoms)
        context.shoes = randomFromArray(shoes)
        context.extra = randomFromArray(extras)
        context.weather = jsonData.weather[0].description
        context.location = jsonData.name

        return resolve(context)
      })
    })
  },
}

const client = new Wit({accessToken, actions})

interactive(client)
