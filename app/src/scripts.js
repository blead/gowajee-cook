/* global CONFIG, COMMANDS, GowajeeParser, GowajeeExecutor, GowajeeSpeaker, Dictate */
var STATE = {
  connection: {
    connected: false,
    server: CONFIG.defaultServer,
    workers: 0
  },
  speech: {
    listening: false
  },
  transcript: {
    memory: [],
    current: ''
  },
  log: {
    messages: []
  }
}

var parser = new GowajeeParser(COMMANDS.data, {
  thresholds: COMMANDS.thresholds,
  maxLengths: COMMANDS.maxLengths,
  minLengths: COMMANDS.minLengths
})

var speaker = new GowajeeSpeaker(CONFIG.voice.name, CONFIG.voice.pitch, CONFIG.voice.rate, CONFIG.voice.volume)

var executor = new GowajeeExecutor({
  'UNKNOWN': function (action) {
    return
  },
  'WAKE_PHRASE': function (action) {
    if (STATE.transcript.memory.length > 2) {
      clearTranscription()
    }
    speaker.cancel()
    return
  },
  'IDX': function (action) {
    const parameters = action.split('|')
    responses[parameters[0]](parameters[1].replace('IDX_',''))
    return
  }
})

const responses = {
  'GET_RECIPE': function respondRecipe (idx) {
    if (RECIPES[idx]) {
      speaker.speak('วิธีทำ' + RECIPES[idx].name, function () {
        speaker.speakList(RECIPES[idx].steps, 0, clearTranscription)
      })
    }
  },
  'GET_INGREDIENTS': function respondIngredients (idx) {
    if (RECIPES[idx]) {
      speaker.speak('วัตถุดิบในการทำ' + RECIPES[idx].name, function() {
        speaker.speakList(RECIPES[idx].ingredients, 0, clearTranscription)
      })
    }
  }
}

var dictate = new Dictate({
  server: STATE.connection.server.speech,
  serverStatus: STATE.connection.server.status,
  recorderWorkerPath: CONFIG.recorderWorkerPath,
  onReadyForSpeech: function () {
    STATE.connection.connected = true
    STATE.speech.listening = true
    STATE.log.messages.unshift(createMessage('msg', 'READY FOR SPEECH'))
    render(STATE)
  },
  onEndOfSpeech: function () {
    STATE.speech.listening = false
    STATE.log.messages.unshift(createMessage('msg', 'END OF SPEECH'))
    speaker.cancel()
    render(STATE)
  },
  onEndOfSession: function () {
    STATE.connection.connected = false
    STATE.log.messages.unshift(createMessage('msg', 'END OF SESSION'))
    clearTranscription()
    render(STATE)
  },
  onServerStatus: function (json) {
    STATE.connection.workers = json.num_workers_available
    render(STATE)
  },
  onPartialResults: function (hypos) {
    STATE.transcript.current = hypos[0].transcript.replace(/\s/g,'')
    render(STATE)
  },
  onResults: function (hypos) {
    const action = parser.parse(hypos[0].transcript.replace(/\s/g,''))
    STATE.transcript.current = ''
    if (action !== 'UNKNOWN') {
      STATE.transcript.memory.push(hypos[0].transcript.replace(/\s/g,''))
    }
    executor.execute(action)
    render(STATE)
  },
  onError: function (code, data) {
    dictate.cancel()
    STATE.log.messages.unshift(createMessage('err', code, data))
    render(STATE)
  },
  onEvent: function (code, data) {
    STATE.log.messages.unshift(createMessage('msg', code, data))
    render(STATE)
  }
})

function render (state) {
  var transcript = document.getElementById('transcript')
  var targetServer = document.getElementById('targetServer')
  var availableWorkers = document.getElementById('availableWorkers')
  if (state.connection.connected && state.speech.listening) {
    $('#buttonToggleListening').html('Stop')
    $('#buttonToggleListening').addClass('highlight')
    $('#buttonToggleListening').prop('disabled', false)
    $('#buttonCancel').prop('disabled', false)
  } else if (state.connection.connected && !state.speech.listening) {
    $('#buttonToggleListening').html('Stopping...')
    $('#buttonToggleListening').prop('disabled', true)
    $('#buttonCancel').prop('disabled', false)
  } else if (!state.connection.connected && state.connection.workers !== 0) {
    $('#buttonToggleListening').html('Start')
    $('#buttonToggleListening').removeClass('highlight')
    $('#buttonToggleListening').prop('disabled', false)
    $('#buttonCancel').prop('disabled', true)
  } else {
    $('#buttonToggleListening').prop('disabled', true)
    $('#buttonCancel').prop('disabled', true)
  }

  transcript.innerHTML = state.transcript.memory.join(' ') + ' <span id="currentTranscript" style="color: #888">' + state.transcript.current + '</span>'
  targetServer.innerHTML = state.connection.server.speech
  availableWorkers.innerHTML = state.connection.workers
}

function createMessage (tag, code, data) {
  return tag + ': ' + code + ': ' + (data || '')
}

function init () {
  responsiveVoice.setDefaultVoice(CONFIG.voice.name)
  dictate.init()
  $('#buttonToggleListening').click(toggleListening)
  $('#buttonCancel').click(cancel)
  render(STATE)
}

function toggleListening () {
  if (STATE.connection.connected) {
    dictate.stopListening()
  } else {
    dictate.startListening()
  }
}

function cancel () {
  dictate.cancel()
}

function clearTranscription () {
  STATE.transcript.memory = []
  STATE.transcript.current = ''
  parser.reset()
  render(STATE)
}

$(function () {
  init()
})
