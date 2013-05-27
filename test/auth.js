$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var domain = 'TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };

  module('buddycloud.Auth', {
    setup: function() {
      buddycloud.init({'apiUrl': apiUrl, 'domain': domain});
      // Spy $.ajax
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      buddycloud.Auth.logout();
      // Restore $.ajax
      $.ajax.restore();
    }
  });

  function checkAjax() {
    ok($.ajax.calledWithExactly({
      url: apiUrl,
      type: 'GET',
      xhrFields: {withCredentials: true},
      headers: {'Authorization': Util.authHeader(user.jid, user.password)}
    }));
  }

  // buddycloud.Auth.login

  test(
    '.login(): wrong username or password',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', apiUrl,
                         [401, {'Content-Type': 'text/plain'}, 'Unauthorized']);

      buddycloud.Auth.login(user.jid, user.password).done(function() {
        ok(false, 'unexpected success');
      }).fail(function() {
        // Force fail
         equal(false, buddycloud.ready(), 'login failure');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );

  test(
    '.login(): successful login',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', apiUrl,
                         [204, {'Content-Type': 'text/plain'}, 'No content']);

      buddycloud.Auth.login(user.jid, user.password).done(function() {
        ok(buddycloud.ready(), 'successful login');
      }).fail(function() {
        // Force fail
        ok(false, 'unexpected login error');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );

  test(
    '.login(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.Auth.login({jid: 'jid'});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Auth.login(jid, password)');
        },
        'throws required parameters error'
      );
    }
  );

  // buddycloud.Auth.logout()
  test(
    '.login(): successful login',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', apiUrl,
                         [204, {'Content-Type': 'text/plain'}, 'No content']);

      buddycloud.Auth.login(user.jid, user.password).done(function() {
        ok(buddycloud.ready(), 'successful login');
      }).fail(function() {
        // Force fail
        ok(false, 'unexpected login error');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );
});