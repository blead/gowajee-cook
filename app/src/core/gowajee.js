/* global Fuse, responsiveVoice */
function GowajeeParser (rawData, options) {
  this.state = {
    index: 0
  }
  this.data = rawData.map(function (list, idx) {
    return new Fuse(list, {
      shouldSort: true,
      threshold: options.thresholds[idx],
      location: 0,
      distance: 100,
      maxPatternLength: options.maxLengths[idx],
      minMatchCharLength: options.minLengths[idx],
      keys: ['key']
    })
  })
  this.parse = function (command) {
    const results = this.data[this.state.index].search(command)
    if (results.length > 0) {
      this.state = results[0].reducer(this.state)
      return results[0].action
    } else {
      return 'UNKNOWN'
    }
  },
  this.reset = function (command) {
    this.state.index = 0
  }
}

function GowajeeExecutor (actions) {
  this.execute = function (action) {
    if (/\|IDX_\d$/.test(action)) {
      actions['IDX'](action)
    } else {
      actions[action](action)
    }
  }
}

function GowajeeSpeaker (speaker, pitch, rate, volume) {
  this.speaker = speaker
  this.pitch = pitch
  this.rate = rate
  this.volume = volume
  this.cancel = function () {
    responsiveVoice.cancel()
  }
  const speak = function (text, callback) {
    responsiveVoice.speak(text, speaker, {
      pitch: pitch,
      rate: rate,
      volume: volume,
      onend: callback
    })
  }
  const speakList = function (list, idx, callback) {
    if (list && idx < list.length) {
      speak((idx+1) + ' ' + list[idx], function() {
        speakList(list, idx + 1)
      })
    } else {
      callback()
    }
  }
  this.speak = speak
  this.speakList = speakList
}
