$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var domain = 'TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };
  var channel = 'test@topics.TEST.COM';
  var node = 'node';

  module('buddycloud.Node', {
    setup: function() {
      Util.init(apiUrl, domain, user.jid, user.password);
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      buddycloud.Auth.logout();
      $.ajax.restore();
    }
  });

  function checkAjax() {
    ok($.ajax.calledWithExactly({
      url: apiUrl + '/' + channel + '/' + node,
      type: 'POST',
      xhrFields: {withCredentials: true},
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

      buddycloud.Node.create({'channel': channel, 'node': node}).done(function() {
        ok(true, 'node created');
      }).fail(function() {
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

      buddycloud.Node.create({'channel': channel, 'node': node}).done(function() {
        ok(false, 'unexpected success');
      }).fail(function() {
        ok(true, 'node not created');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );

  test(
    '.create(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.Node.create({'node': node});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Node.create({channel, node})');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.create(): try to create a node without being logged',

    function() {
      buddycloud.Auth.logout();

      throws(
        function() {
          buddycloud.Node.create({'channel': channel, 'node': node});
        },
        function(error) {
          return error.message === Util.notLoggedMessage();
        },
        'throws required parameters error'
      );
    }
  );

});