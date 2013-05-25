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
    '.create(): successfully create node',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', apiUrl + '/' + channel + '/' + node,
                         [201, {'Content-Type': 'text/plain'}, 'Created']);

      buddycloud.Node.create(channel, node).done(function() {
        ok(true, 'node created');
      }).error(function() {
        ok(false, 'unexpected failure');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );

  test(
    '.create(): try to a create a not in a not allowed channel',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', apiUrl + '/' + channel + '/' + node,
                         [403, {'Content-Type': 'text/plain'}, 'Forbidden']);

      buddycloud.Node.create(channel, node).done(function() {
        ok(false, 'unexpected success');
      }).error(function() {
        ok(true, 'node not created');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );

});