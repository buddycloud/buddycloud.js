var Util = (function() {
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

  return {
    init: init,
    authHeader: authHeader
  };
})();