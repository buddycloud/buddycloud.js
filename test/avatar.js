$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var domain = 'TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };
  var channel = 'test@topics.TEST.COM';

  module('buddycloud.Avatar', {
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

  var metadata = {'id':'2SMgyf6j7FSqSvu5s0kl',
                  'author':'test@TEST.COM',
                  'mimeType':'image/png',
                  'fileExtension':'png',
                  'shaChecksum':'8bc42cbef340facfegh768a7eae3de6fa6850e0c',
                  'fileSize':2048,
                  'height':100,'width':100,
                  'entityId':'test@topics@TEST.COM'};

  // buddycloud.Avatar.get

  test(
    '.get(): get channel avatar',

    function() {
      var url = apiUrl + '/' + channel + '/media/avatar';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200,
                         {
                          'content-type': metadata.mimeType,
                          'content-length:': metadata.fileSize,
                          'cache-control': 'max-age=86400, public',
                          'server': 'buddycloud media server'
                         }, '']);

      var opt = {
        url: url,
        type: 'GET'
      };

      buddycloud.Avatar.get(channel).done(function(data) {
        ok(true, 'avatar retrieved');
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
    '.get(): try to get not existent avatar',

    function() {
      var url = apiUrl + '/' + channel + '/media/avatar';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [404,
                         {'Content-Type': 'text/plain'}, 'Not found']);

      var opt = {
        url: url,
        type: 'GET'
      };

      buddycloud.Avatar.get(channel).done(function(data) {
        ok(false, 'unexpected success');
      }).fail(function() {
        ok(true, 'avatar not found');
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
          buddycloud.Avatar.get();
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Avatar.get(channel[, {maxheight, maxwidth}])');
        },
        'throws required parameters error'
      );
    }
  );

  // buddycloud.Media.set

  function blobFile() {
    return {name: 'avatar.jpg', size: metadata.fileSize, type: metadata.mimeType};
  }

  test(
    '.set(): set avatar FormData',

    function() {
      var url = apiUrl + '/' + channel + '/media/avatar';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('PUT', url,
                         [201,
                         {'Content-Type': 'application/json'}, JSON.stringify(metadata)]);

      var mediaFile = blobFile();
      var opt = {
        url: url,
        type: 'PUT',
        xhrFields: {withCredentials: true},
        processData: false,
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: Util.buildFormData(mediaFile)
      };

      buddycloud.Avatar.set(channel, {'file': mediaFile}).done(function() {
        ok(true, 'avatar successfully uploaded');
      }).fail(function() {
        // Force fail
        ok(false, 'unexpected failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  function base64File() {
    return btoa(JSON.stringify(blobFile()));
  }

  test(
    '.set(): set avatar using WebForm',

    function() {
      var url = apiUrl + '/' + channel + '/media/avatar';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('PUT', url,
                         [201,
                         {'Content-Type': 'application/json'}, JSON.stringify(metadata)]);

      var mediaFile = base64File();
      var opt = {
        url: url,
        type: 'PUT',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: {'data': mediaFile, 'content-type': 'image/jpeg'}
      };

      buddycloud.Avatar.set(channel, {'file': mediaFile, 'content-type': 'image/jpeg'}).done(function() {
        ok(true, 'avatar successfully uploaded');
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
    '.set(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.Avatar.set(channel, {'content-type': 'image/jpeg'});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Avatar.set(channel, {file[, content-type, filename, title]})');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.set(): try to set avatar without being logged',

    function() {
      buddycloud.Auth.logout();

      throws(
        function() {
          buddycloud.Avatar.set(channel, {'file': base64File(), 'content-type': 'image/jpeg'});
        },
        function(error) {
          return error.message === Util.notLoggedMessage();
        },
        'throws not logged error'
      );
    }
  );

  // buddycloud.Avatar.remove

  test(
    '.remove(): remove avatar',

    function() {
      var url = apiUrl + '/' + channel + '/media/avatar';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('DELETE', url,
                         [200, {'Content-Type': 'text/plain'}, 'OK']);

      var opt = {
        url: url,
        type: 'DELETE',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password)
        }
      };

      buddycloud.Avatar.remove(channel).done(function() {
        ok(true, 'avatar successfully deleted');
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
    '.remove(): try to remove avatar file from a not allowed channel',

    function() {
      var url = apiUrl + '/' + channel + '/media/avatar';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('DELETE', url,
                         [403, {'Content-Type': 'text/plain'}, 'Forbidden']);

      var opt = {
        url: url,
        type: 'DELETE',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password)
        }
      };

      buddycloud.Avatar.remove(channel).done(function() {
        ok(false, 'unexpected success');
      }).fail(function() {
        ok(true, 'avatar not removed');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.remove(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.Avatar.remove();
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Avatar.remove(channel)');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.remove(): try to remove avatar without being logged',

    function() {
      buddycloud.Auth.logout();

      throws(
        function() {
          buddycloud.Avatar.remove(channel);
        },
        function(error) {
          return error.message === Util.notLoggedMessage();
        },
        'throws not logged error'
      );
    }
  );
});