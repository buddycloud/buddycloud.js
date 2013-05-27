$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var domain = 'TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };
  var channel = 'test@topics.TEST.COM';

  module('buddycloud.Media', {
    setup: function() {
      Util.init(apiUrl, domain, user.jid, user.password);
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      buddycloud.Auth.logout();
      $.ajax.restore();
    }
  });

  function checkAjax(opt) {
    ok($.ajax.calledWithExactly(opt));
  }

  var allSubscriptions = {'test@TEST.COM/photos':'owner',
    'help@topics.TEST.COM/status':'member',
    'help@topics.TEST.COM/posts':'publisher',
    'lounge@topics.TEST.COM/posts':'publisher',
    'lounge@topics.TEST.COM/status':'member',
    'test@TEST.COM/status':'owner',
    'test@TEST.COM/geo/previous':'owner',
    'test@TEST.COM/geo/current':'owner',
    'test@TEST.COM/geo/next':'owner',
    'test@TEST.COM/subscriptions':'owner',
    'test@TEST.COM/posts':'owner'};

  var subscriptions = {'alice@TEST.COM': 'publisher'};

  // buddycloud.Subscribed.get

  test(
    '.get(): get user subscriptions',

    function() {
      var url = apiUrl + '/subscribed';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(allSubscriptions)]);

      var opt = {
        url: url,
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        }
      };

      buddycloud.Subscribed.get().done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(allSubscriptions), 'subscriptions successfully retrieved');
      }).fail(function() {
        // Force fail
        ok(false, 'unexpected failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.get(): wrong username or password on get subscriptions',

    function() {
      var url = apiUrl + '/subscribed';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [403, {'Content-Type': 'text/plain'}, 'Forbidden']);

      var opt = {
        url: url,
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        }
      };

      buddycloud.Subscribed.get().done(function(data) {
        ok(false, 'unexpected success');
      }).fail(function() {
        ok(true, 'wrong username or password');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.get(): try to get subscriptions without being logged',

    function() {
      buddycloud.Auth.logout();

      throws(
        function() {
          buddycloud.Subscribed.get();
        },
        function(error) {
          return error.message === Util.notLoggedMessage();
        },
        'throws not logged error'
      );
    }
  );

  // buddycloud.Subscribed.update

  test(
    '.update(): update user subscriptions',

    function() {
      var url = apiUrl + '/subscribed';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', url,
                         [200, {'Content-Type': 'text/plain'}, 'OK']);

      var opt = {
        url: url,
        type: 'POST',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password)
        },
        data: JSON.stringify(subscriptions)
      };

      buddycloud.Subscribed.update(subscriptions).done(function() {
        ok(true, 'subscriptions updated');
      }).fail(function() {
        // Force fail
        ok(false, 'unexpected failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.update(): wrong username or password',

    function() {
      var url = apiUrl + '/subscribed';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', url,
                         [403, {'Content-Type': 'text/plain'}, 'Forbidden']);

      var opt = {
        url: url,
        type: 'POST',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password)
        },
        data: JSON.stringify(subscriptions)
      };

      buddycloud.Subscribed.update(subscriptions).done(function() {
        ok(false, 'unexpected success');
      }).fail(function() {
        ok(true, 'subscriptions not updated');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.update(): try to update subscriptions without being logged',

    function() {
      buddycloud.Auth.logout();

      throws(
        function() {
          buddycloud.Subscribed.update(subscriptions);
        },
        function(error) {
          return error.message === Util.notLoggedMessage();
        },
        'throws not logged error'
      );
    }
  );
});