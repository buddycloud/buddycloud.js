$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var domain = 'TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };
  var channel = 'test@topics.TEST.COM';

  module('buddycloud.Channel', {
    setup: function() {
      Util.init(apiUrl, domain, user);
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      buddycloud.Auth.logout();
      $.ajax.restore();
    }
  });

  function checkAjax() {
    ok($.ajax.calledWithExactly({
      url: apiUrl + '/' + channel,
      type: 'POST',
      xhrFields: {withCredentials: true},
      headers: {'Authorization': Util.authHeader(user.jid, user.password)}
    }));
  }

  test(
    '.create(): successfully create topic channel',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', apiUrl + '/' + channel,
                         [201, {'Content-Type': 'text/plain'}, 'Created']);

      buddycloud.Channel.create(channel).done(function() {
        ok(true, 'channel created');
      }).fail(function() {
        ok(false, 'unexpected failure');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );

  test(
    '.create(): try to a create an already existent topic channel',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', apiUrl + '/' + channel,
                         [500, {'Content-Type': 'text/plain'}, 'Internal Server Error']);

      buddycloud.Channel.create(channel).done(function() {
        ok(false, 'unexpected success');
      }).fail(function() {
        ok(true, 'topic channel not created');
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
          buddycloud.Channel.create();
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Channel.create(channel)');
        },
        'throws required parameters error'
      );
    }
  );


  test(
    '.create(): try to create channel without being logged',

    function() {
      // Remove login information
      buddycloud.Auth.logout();

      throws(
        function() {
          buddycloud.Channel.create(channel);
        },
        function(error) {
          return error.message === Util.notLoggedMessage();
        },
        'throws not logged error'
      );
    }
  );

});