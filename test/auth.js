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
    ok($.ajax.calledWithArgs({
      url: apiUrl + '/login',
      type: 'POST',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(user.jid + ':' + user.password));
      }
    }));
  }

  test(
    'error on login',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', apiUrl + '/login',
                         [403, {'Content-Type': 'text/plain'}, 'Forbidden']);

      buddycloud.Auth.login(user.jid, user.password).done(function() {
        ok(false, 'login success: should not login in this case');
      }).error(function() {
        // Force fail
         equal(false, buddycloud.ready(), 'login failure: expected login failure');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );

  test(
    'successful login',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', apiUrl + '/login',
                         [200, {'Content-Type': 'text/plain'}, 'OK']);

      buddycloud.Auth.login(user.jid, user.password).done(function() {
        ok(buddycloud.ready(), 'login success: lib changed its state to ready');
      }).error(function() {
        // Force fail
        ok(false, 'login failure: unexpected login error');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );
});