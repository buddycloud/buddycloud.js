var Util = (function() {
  function init(apiUrl, userJid, userPassword) {
    // Initialize lib
    buddycloud.init(apiUrl);

    // Fake server
    var server = sinon.sandbox.useFakeServer();
    server.respondWith('GET', apiUrl, [204, {'Content-Type': 'text/plain'}, 'No content']);

    // Do login
    buddycloud.Auth.login(userJid, userPassword);
    server.respond();
  }

  function authHeader(userJid, userPassword) {
    return 'Basic ' + btoa(userJid + ':' + userPassword);
  }

  function buildFormData(file, extra) {
    var formData = new FormData();
    formData.append('data', JSON.stringify(file));
    formData.append('content-type', file.type);

    if (extra) {
      for (var i in extra) {
        formData.append(i, extra[i]);
      }
    }

    return formData;
  }

  function paramMissingMessage(method) {
    return 'Parameters missing. Method usage: ' + method + '.';
  }

  function notLoggedMessage() {
    return 'Must login first: buddycloud.Auth.login(jid, password).';
  }

  return {
    init: init,
    authHeader: authHeader,
    buildFormData: buildFormData,
    paramMissingMessage: paramMissingMessage,
    notLoggedMessage: notLoggedMessage
  };
})();