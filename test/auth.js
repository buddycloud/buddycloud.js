$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };

  module('buddycloud.Auth', {
    setup: function() {
      buddycloud.init(apiUrl);
      // Spy $.ajax
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      buddycloud.reset();
      // Restore $.ajax
      $.ajax.restore();
    }
  });

  function checkAjax() {
    ok($.ajax.calledWithExactly({
      url: apiUrl + '/login',
      type: 'POST',
      headers: {'Authorization': Util.authHeader(user.jid, user.password)}
    }));
  }

  test(
    '.login(): wrong username or password',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', apiUrl + '/login',
                         [403, {'Content-Type': 'text/plain'}, 'Forbidden']);

      buddycloud.Auth.login(user.jid, user.password).done(function() {
        ok(false, 'unexpected success');
      }).error(function() {
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
      server.respondWith('POST', apiUrl + '/login',
                         [200, {'Content-Type': 'text/plain'}, 'OK']);

      buddycloud.Auth.login(user.jid, user.password).done(function() {
        ok(buddycloud.ready(), 'successful login');
      }).error(function() {
        // Force fail
        ok(false, 'unexpected login error');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );
});