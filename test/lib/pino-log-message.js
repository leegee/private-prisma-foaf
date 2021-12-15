module.exports = opts => require('pino-pretty')({
  ...opts,
  messageFormat: (log, messageKey) => {
    return typeof log[messageKey] === 'string'
      ? '' + log[messageKey]
      : '' + JSON.stringify(log[messageKey], null, 4);
  }
})