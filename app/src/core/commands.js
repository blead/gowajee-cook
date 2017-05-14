/* global RECIPES */
var COMMANDS = {
  thresholds: [0.4, 0.4, 0.4],
  maxLengths: [16, 36, 16],
  minLengths: [3, 3, 3]
}

;(function () {
  function increaseIndex (state) {
    const nextState = Object.assign({}, state)
    nextState.index++
    return nextState
  }
  function reset (state) {
    const nextState = Object.assign({}, state)
    nextState.index = 0
    return nextState
  }
  const actions = [
    {name: 'ขอสูตรอาหาร', action: 'GET_RECIPE'},
    {name: 'สอนทำ', action: 'GET_RECIPE'},
    {name: 'อยากทำ', action: 'GET_RECIPE'},
    {name: 'หาวิธีทำ', action: 'GET_RECIPE'},
    {name: 'ขอวัตถุดิบ', action: 'GET_INGREDIENTS'}
  ]
  var products = []
  RECIPES.forEach(function (recipe, idx) {
    actions.forEach(function (action) {
      products.push({key: action.name + ' ' + recipe.name, action: action.action + '|IDX_' + idx, reducer: increaseIndex})
    })
  })
  COMMANDS.data = [
    [{key: 'โกวาจี', action: 'WAKE_PHRASE', reducer: increaseIndex}],
    products,
    [{key: 'โกวาจี', action: 'WAKE_PHRASE', reducer: reset}],
  ]
})()
