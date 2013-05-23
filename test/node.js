$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };
  var channel = 'test@topics.buddycloud.org';
  var node = 'node';

  module('buddycloud.Node', {
    setup: function() {
      Util.init(apiUrl, user.jid, user.password);
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      buddycloud.reset();
      $.ajax.restore();
    }
  });

  function checkAjax() {
    ok($.ajax.calledWithExactly({
      url: apiUrl + '/' + channel + '/' + node,
      type: 'POST',
      headers: {'Authorization': Util.authHeader(user.jid, user.password)}
    }));
  }

  test(
    'create node',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', apiUrl + '/' + channel + '/' + node,
                         [201, {'Content-Type': 'text/plain'}, 'Created']);

      buddycloud.Node.create(channel, node).done(function() {
        ok(true, 'node created');
      }).error(function() {
        // Force fail
        ok(false, 'node creation failure');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );

});