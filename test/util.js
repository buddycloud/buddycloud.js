var Util = (function() {
  function init(apiUrl, user) {
    // Initialize lib
    buddycloud.init(apiUrl);

    // Fake server
    var server = sinon.sandbox.useFakeServer();
    server.respondWith('POST', apiUrl + '/login', [200, {'Content-Type': 'text/plain'}, 'OK']);

    // Do login
    buddycloud.Auth.login(user.jid, user.password);
    server.respond();
  }

  return {
    init: init
  };
})();