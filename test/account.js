$(document).ready(function() {
  'use strict';


  var apiUrl = 'https://api.TEST.COM';
  var domain = 'TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password',
    email: 'email@TEST.com'
  };

  module('buddycloud.Account', {
    setup: function() {
      buddycloud.init({'apiUrl': apiUrl, 'domain': domain});
      // Spy $.ajax
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      // Restore $.ajax
      $.ajax.restore();
    }
  });

  function checkAjax() {
    ok($.ajax.calledWithExactly({
      url: apiUrl + '/account',
      type: 'POST',
      data: JSON.strinfigy({'username': user.jid, 'password': user.password, 'email': user.email})
    }));
  }

  test(
    '.create(): error on create new user',

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', apiUrl + '/account',
                         [503, {'Content-Type': 'text/plain'}, 'Service Unavailable']);

      buddycloud.Account.create(user).done(function() {
          ok(false, 'unexpected success');
      }).error(function() {
          ok(true, 'user not created');
      }).always(function() {
        checkAjax();
      });

      server.respond();
    }
  );

  test(
    '.create(): create a new user',

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

  test(
    '.create(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.Account.create({'jid': user.jid});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Account.create({jid, password, email})');
        },
        'throws required parameters error'
      );
    }
  );

});