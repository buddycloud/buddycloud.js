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

  module('buddycloud.Metadata', {
    setup: function() {
      Util.init(apiUrl, domain, user.jid, user.password);
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      buddycloud.Auth.logout();
      $.ajax.restore();
    }
  });

  var metadata = {'title':'a title',
      'description':'a description',
      'access_model':'open',
      'creation_date':'2013-01-1T10:00:00.000Z',
      'channel_type':'personal',
      'default_affiliation':'publisher'};

  function checkAjax(opt) {
    ok($.ajax.calledWithExactly(opt));
  }

  // buddycloud.Metadata.get

  test(
    '.get(): retrieve channel metadata',

    function() {
      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/metadata/' + node;
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(metadata)]);

      var opt = {
        url: url,
        type: 'GET',
        headers: {'Accept': 'application/json'}
      };

      buddycloud.Metadata.get({'channel': channel, 'node': node}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(metadata), 'successful get');
      }).fail(function() {
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
          buddycloud.Metadata.get({'abc': channel, 'node': node});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Metadata.get({channel, node})');
        },
        'throws required parameters error'
      );
    }
  );

  // buddycloud.Metadata.update

  test(
    '.update(): update channel metadata',

    function() {
      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/metadata/' + node;
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', url, [200, {'Content-Type': 'text/plain'}, 'OK']);

      var opt = {
        url: url,
        type: 'POST',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password)
        },
        data: JSON.stringify(metadata)
      };

      buddycloud.Metadata.update({'channel': channel, 'node': node}, metadata).done(function() {
        ok(true, 'metada updated');
      }).fail(function() {
        ok(false, 'unexpected failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.update(): try to update metadata from not allowed channel',

    function() {
      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/metadata/' + node;
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', url, [403, {'Content-Type': 'text/plain'}, 'Forbidden']);

      var opt = {
        url: url,
        type: 'POST',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password)
        },
        data: JSON.stringify(metadata)
      };

      buddycloud.Metadata.update({'channel': channel, 'node': node}, metadata).done(function(data) {
        ok(false, 'unexpected success');
      }).fail(function(a, b) {
        ok(true, 'metadata not updated');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.update(): not using required parameters 1',

    function() {
      throws(
        function() {
          buddycloud.Metadata.update({'channel': channel, 'node': node});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Metadata.update({channel, node}, {title, description, access_model, default_affiliation})');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.update(): not using required parameters 2',

    function() {
      throws(
        function() {
          buddycloud.Metadata.update({'channel': channel, 'node': node}, {'title': 'abc'});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Metadata.update({channel, node}, {title, description, access_model, default_affiliation})');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.update(): try to update metadata without being logged',

    function() {
      // Remove login information
      buddycloud.Auth.logout();

      throws(
        function() {
          buddycloud.Metadata.update({'channel': channel, 'node': node}, metadata);
        },
        function(error) {
          return error.message === Util.notLoggedMessage();
        },
        'throws not logged error'
      );
    }
  );
});