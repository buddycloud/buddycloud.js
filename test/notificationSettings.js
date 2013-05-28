$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var domain = 'TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };

  module('buddycloud.NotificationSettings', {
    setup: function() {
      Util.init(apiUrl, domain, user);
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      buddycloud.Auth.logout();
      $.ajax.restore();
    }
  });

  var gcmSettings = {
    target: 'foo',
    postAfterMe: 'true',
    postMentionedMe: 'false',
    postOnMyChannel: 'true',
    postOnSubscribedChannel: 'false',
    followMyChannel: 'false',
    followRequest: 'false'
  };

  var emailSettings = {
    target: 'test@TEST.COM',
    postAfterMe: 'false',
    postMentionedMe: 'false',
    postOnMyChannel: 'true',
    postOnSubscribedChannel: 'false',
    followMyChannel: 'true',
    followRequest: 'true'
  };

  // buddycloud.NotificationSettings.get

  test(
    '.get(): get email notifications settings',

    function() {
      var url = apiUrl + '/notification_settings?type=email';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(emailSettings)]);

      var opt = {
        url: url,
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: {'type': 'email'}
      };

      buddycloud.NotificationSettings.get('email').done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(emailSettings), 'successful get');
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
    '.get(): get gcm notifications settings',

    function() {
      var url = apiUrl + '/notification_settings?type=gcm';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(gcmSettings)]);

      var opt = {
        url: url,
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: {'type': 'gcm'}
      };

      buddycloud.NotificationSettings.get('gcm').done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(gcmSettings), 'successful get');
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
    '.get(): wrong username or password',

    function() {
      var url = apiUrl + '/notification_settings?type=email';

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
        },
        data: {'type': 'gcm'}
      };

      buddycloud.NotificationSettings.get('gcm').done(function() {
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
    '.get(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.NotificationSettings.get();
        },
        function(error) {
          return error.message === Util.paramMissingMessage('NotificationSettings.get(type)');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.get(): try to get notification settings without being logged',

    function() {
      buddycloud.Auth.logout();

      throws(
        function() {
          buddycloud.NotificationSettings.get('gcm');
        },
        function(error) {
          return error.message === Util.notLoggedMessage();
        },
        'throws not logged error'
      );
    }
  );

  // buddycloud.NotificationSettings.update

  test(
    '.update(): update email notifications settings',

    function() {
      var url = apiUrl + '/notification_settings';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(emailSettings)]);

      var postEmailSettings = $.extend({}, emailSettings);
      postEmailSettings.type = 'email';

      var opt = {
        url: url,
        type: 'POST',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: JSON.stringify(postEmailSettings)
      };

      buddycloud.NotificationSettings.update(postEmailSettings).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(emailSettings), 'successful update');
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
    '.update(): update gcm notifications settings',

    function() {
      var url = apiUrl + '/notification_settings';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(gcmSettings)]);

      var postGcmSettings = $.extend({}, gcmSettings);
      postGcmSettings.type = 'gcm';

      var opt = {
        url: url,
        type: 'POST',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: JSON.stringify(postGcmSettings)
      };

      buddycloud.NotificationSettings.update(postGcmSettings).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(gcmSettings), 'successful update');
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
      var url = apiUrl + '/notification_settings';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', url,
                         [403, {'Content-Type': 'text/plain'}, 'Forbidden']);

      var postEmailSettings = $.extend({}, emailSettings);
      postEmailSettings.type = 'gcm';

      var opt = {
        url: url,
        type: 'POST',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: JSON.stringify(postEmailSettings)
      };

      buddycloud.NotificationSettings.update(postEmailSettings).done(function() {
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
    '.update(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.NotificationSettings.update(emailSettings);
        },
        function(error) {
          return error.message === Util.paramMissingMessage('NotificationSettings.update({type, target, postAfterMe, postMentionedMe, ' +
            'postOnMyChannel, postOnSubscribedChannel, followMyChannel, followRequest})');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.update(): try to update notification settings without being logged',

    function() {
      buddycloud.Auth.logout();

      throws(
        function() {
          var postGcmSettings = $.extend({}, gcmSettings);
          postGcmSettings.type = 'gcm';
          buddycloud.NotificationSettings.update(postGcmSettings);
        },
        function(error) {
          return error.message === Util.notLoggedMessage();
        },
        'throws not logged error'
      );
    }
  );

});