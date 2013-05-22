$(document).ready(function() {

  apiUrl = 'https://api.TEST.COM';
  user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };
  channel = 'test@topics.buddycloud.org';
  node = 'node';
  bc = buddycloud;

  module('buddycloud.Node');

  test('create()', function() {
    // Mock HTTP API server
    var server = this.sandbox.useFakeServer();
    server.respondWith('POST', apiUrl + '/account',
                       [201, {'Content-Type': 'text/plain'}, 'OK']);

    bc.Node.create(channel, node).then(
      function() {
        ok(bc.ready(), 'should be ready');
      },
      function() {
        // Force fail
        ok(false, 'should call success function');
      }
    );

    server.respond();
  });

});