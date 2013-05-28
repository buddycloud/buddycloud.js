$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var domain = 'TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };

  module('buddycloud.Sync', {
    setup: function() {
      Util.init(apiUrl, domain, user.jid, user.password);
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      buddycloud.Auth.logout();
      $.ajax.restore();
    }
  });

  var since = new Date(2013, 0, 1).toISOString();
  var sinceUrlSafe = since.replace(':', '%');
  var max = 2;
  var node = 'node';

  var sync = {'/user/test1@topics.TEST.COM/node': [{
      id: '40a4e61a',
      author: 'acct:abc@TEST.COM',
      published: '2013-05-28T08:02:16.899Z',
      updated: '2013-05-28T08:02:16.899Z',
      content: 'abc abc'
    }, {
      id: 'd57d6491',
      author: 'acct:test2@TEST.COM',
      published: '2013-05-28T07:53:23.223Z',
      updated: '2013-05-28T07:53:23.223Z',
      content: 'test!!!',
      replyTo: '40a4e61a'
    }],
    '/user/test2@topics.TEST.COM/node': [{
      id: '5e640a1a',
      author: 'acct:test1@TEST.COM',
      published: '2013-01-28T08:02:16.899Z',
      updated: '2013-01-28T08:02:16.899Z',
      content: 'test test'
    }, {
      id: '7d6491d5',
      author: 'acct:test2@TEST.COM',
      published: '2013-01-01T07:53:23.223Z',
      updated: '2013-01-01T07:53:23.223Z',
      content: 'test test test'
    }]};

  var syncCounters = {
    '/user/report_bugs@topics.buddycloud.org/posts': {
      mentionsCount: 2,
      totalCount: 2
    }, '/user/lounge@topics.buddycloud.org/posts': {
      mentionsCount: 0,
      totalCount: 2
    }};

  function checkAjax(opt) {
    ok($.ajax.calledWithExactly(opt));
  }

  // buddycloud.Sync.get

  test(
    ".get(): sync the content from a channel's node",

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', apiUrl + '/' + node + '/sync?since=2013-01-01T03%3A00%3A00.000Z&max=2',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(sync)]);

      var opt = {
        url: apiUrl + '/' + node + '/sync',
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: {'since': since, 'max': max}
      };

      buddycloud.Sync.get({'node': node, 'since': since, 'max': max}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(sync), 'successful sync');
      }).fail(function(a,b,c) {
        // Force fail
        ok(false, 'unexpected failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    ".get(): sync the content counter from a channel's node",

    function() {
      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', apiUrl + '/' + node + '/sync?since=2013-01-01T03%3A00%3A00.000Z&max=2&counters=true',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(sync)]);

      var opt = {
        url: apiUrl + '/' + node + '/sync',
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: {'since': since, 'max': max, 'counters': true}
      };

      buddycloud.Sync.get({'node': node, 'since': since, 'max': max, 'counters': true}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(sync), 'successful sync');
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
          buddycloud.Sync.get({'node': node, 'since': since, 'counters': true});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Sync.get({node, since, max[, counters]})');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.get(): try to sync without being logged',

    function() {
      buddycloud.Auth.logout();

      throws(
        function() {
          buddycloud.Sync.get({'node': node, 'since': since, 'max': max});
        },
        function(error) {
          return error.message === Util.notLoggedMessage();
        },
        'throws not logged error'
      );
    }
  );

});