var Util = (function() {
  'use strict';

  function init(apiUrl, userJid, userPassword) {
    // Initialize lib
    buddycloud.init(apiUrl);

    // Fake server
    var server = sinon.sandbox.useFakeServer();
    server.respondWith('POST', apiUrl + '/login', [200, {'Content-Type': 'text/plain'}, 'OK']);

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

  return {
    init: init,
    authHeader: authHeader,
    buildFormData: buildFormData
  };
})();