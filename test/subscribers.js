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

  var subscribers = {'test1@buddycloud.org':'owner',
    'test2@buddycloud.org':'publisher',
    'test3@buddycloud.org':'publisher',
    'test4@buddycloud.org':'follower'};

  test(
    ".get(): get node's subscribers",

    function() {
      var url = apiUrl + '/' + channel + '/subscribers/' + node;

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(subscribers)]);

      var opt = {
        url: url,
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        }
      };

      buddycloud.Subscribers.get({'channel': channel, 'node': node}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(subscribers), 'subscribers successfully retrieved');
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
    ".get(): get node's subscribers from private channel",

    function() {
      var url = apiUrl + '/' + channel + '/subscribers/' + node;

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

      buddycloud.Subscribers.get({'channel': channel, 'node': node}).done(function(data) {
        ok(false, 'unexpected success');
      }).fail(function() {
        ok(true, 'subscribers not retrieved');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    ".get(): get node's subscribers without being logged",

    function() {
      buddycloud.Auth.logout();
      var url = apiUrl + '/' + channel + '/subscribers/' + node;

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(subscribers)]);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      buddycloud.Subscribers.get({'channel': channel, 'node': node}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(subscribers), 'subscribers successfully retrieved');
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
    '.get(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.Subscribers.get({'channel': channel});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Subscribers.get({channel, node})');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.get(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.Subscribers.get({'123': 'abc', 'abc': '123'});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Subscribers.get({channel, node})');
        },
        'throws required parameters error'
      );
    }
  );

});