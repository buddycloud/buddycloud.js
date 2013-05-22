$(document).ready(function() {

  apiUrl = 'https://api.TEST.COM';
  user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };
  bc = buddycloud;

  module('buddycloud.Auth');

  test('login()', function() {
    // Mock HTTP API server
    var server = this.sandbox.useFakeServer();
    server.respondWith('POST', apiUrl + '/account',
                       [200, {'Content-Type': 'text/plain'}, 'OK']);

    bc.Auth.login(user).then(
      function() {
        ok(bc.ready(), 'should be ready');
      },
      function() {
        // Force fail
        ok(false);
      }
    );

    server.respond();
  });
});