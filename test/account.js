$(document).ready(function() {

  apiUrl = 'https://api.TEST.COM';
  user = {
    jid: 'user@TEST.COM',
    password: 'password',
    email: 'email@TEST.com'
  };
  bc = buddycloud;

  module('buddycloud.Account');

  test('create()', function() {
    // Mock HTTP API server
    var server = this.sandbox.useFakeServer();
    server.respondWith('POST', apiUrl + '/account',
                       [201, {'Content-Type': 'text/plain'}, 'OK']);

    bc.Account.create(user).then(
      function() {
        ok(bc.ready(), 'should be ready');
      },
      function(error) {
        // Force fail
        ok(false, 'should call success function');
      }
    );

    server.respond();
  });
});