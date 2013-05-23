$(document).ready(function() {
  'use strict';


  var apiUrl = 'https://api.TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password',
    email: 'email@TEST.com'
  };

  module('buddycloud.Account', {
    setup: function() {
      buddycloud.init(apiUrl);
      // Spy $.ajax
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      // Restore $.ajax
      $.ajax.restore();
    }
  });

  function checkAjax() {
    ok($.ajax.withArgs({
      url: apiUrl + '/account',
      type: 'POST',
      data: JSON.strinfigy({'username': user.jid, 'password': user.password, 'email': user.email})
    }).calledOnce);
  }

  test(
    'error on create new user',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', apiUrl + '/account',
                         [503, {'Content-Type': 'text/plain'}, 'Service Unavailable']);

      buddycloud.Account.create(user).done(function() {
          ok(false, 'user should not be created');
      }).error(function() {
          // Force fail
          ok(true, 'user created');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );

  test(
    'create new user',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', apiUrl + '/account',
                         [201, {'Content-Type': 'text/plain'}, 'OK']);

      buddycloud.Account.create(user).done(function() {
          ok(true, 'user created');
      }).error(function() {
          // Force fail
          ok(false, 'unexpected error');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );
});