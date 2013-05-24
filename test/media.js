$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };
  var channel = 'test@topics.buddycloud.org';

  module('buddycloud.Media', {
    setup: function() {
      Util.init(apiUrl, user.jid, user.password);
      sinon.spy($, 'ajax');
    },
    teardown: function() {
      buddycloud.reset();
      $.ajax.restore();
    }
  });

  function checkAjax(opt) {
    ok($.ajax.calledWithExactly(opt));
  }

  var metadata1 = {'id':'2SMgyf6j7FSqSvu5s0kl',
                  'author':'test@buddycloud.org',
                  'mimeType':'image/png',
                  'fileExtension':'png',
                  'shaChecksum':'8bc42cbef340facfegh768a7eae3de6fa6850e0c',
                  'fileSize':2048,
                  'height':100,'width':100,
                  'entityId':'test@topics.buddycloud.org'};

  var metadata2 = {'id':'SKp5f6j7FSq2Svu5s12Y',
                  'author':'test@buddycloud.org',
                  'mimeType':'image/jpeg',
                  'fileExtension':'jpeg',
                  'shaChecksum':'cfe81d68a7efa8bc42cbef340fa6850e0cae3de6',
                  'fileSize':3639247,
                  'height':3264,'width':2448,
                  'entityId':'test@buddycloud.org'};

  // buddycloud.Media.get

  test(
    'get all media metadata',

    function() {
      var url = apiUrl + '/' + channel + '/media/';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify([metadata1, metadata2])]);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        }
      };

      buddycloud.Media.get({'channel': channel}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify([metadata1, metadata2]));
      }).error(function() {
        // Force fail
        ok(false, 'get all media metadata failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    'get all media metadata using parameters',

    function() {
      var url = apiUrl + '/' + channel + '/media/';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?max=2&after=ABCgyf6j7FSqSvu5s0kl',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify([metadata1, metadata2])]);

      var params = {max: 2, after: 'ABCgyf6j7FSqSvu5s0kl'};
      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: params
      };

      buddycloud.Media.get({'channel': channel}, params).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify([metadata1, metadata2]));
      }).error(function() {
        // Force fail
        ok(false, 'get all media metadata failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    'get all media metadata using invalid parameters',

    function() {
      var url = apiUrl + '/' + channel + '/media/';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify([metadata1, metadata2])]);

      var params = {abc: 'abc', 123: '123'};
      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        }
      };

      buddycloud.Media.get({'channel': channel}, params).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify([metadata1, metadata2]));
      }).error(function() {
        // Force fail
        ok(false, 'get all media metadata failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    'get media file',

    function() {
      var url = apiUrl + '/' + channel + '/media/' + metadata1.id;

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200,
                         {
                          'content-type': metadata1.mimeType,
                          'content-length:': metadata1.fileSize,
                          'cache-control': 'max-age=86400, public',
                          'server': 'buddycloud media server'
                         }, '']);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        }
      };

      buddycloud.Media.get({'channel': channel, 'mediaId': metadata1.id}).done(function() {
        ok(true, 'successful get media');
      }).error(function() {
        // Force fail
        ok(false, 'get all media metadata failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    'get media file from not allowed channel',

    function() {
      var url = apiUrl + '/' + channel + '/media/' + metadata1.id;

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [403, {'Content-Type': 'text/plain'}, 'Forbidden']);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        }
      };

      buddycloud.Media.get({'channel': channel, 'mediaId': metadata1.id}).done(function() {
        ok(false, 'should fail');
      }).error(function() {
        // Force fail
        ok(true, 'forbidden');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    'get media file using maxHeight',

    function() {
      var url = apiUrl + '/' + channel + '/media/' + metadata1.id;

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?maxHeight=100',
                         [200,
                         {
                          'content-type': metadata1.mimeType,
                          'content-length:': metadata1.fileSize,
                          'cache-control': 'max-age=86400, public',
                          'server': 'buddycloud media server'
                         }, '']);

      var params = {maxHeight: 100};
      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: params
      };

      buddycloud.Media.get({'channel': channel, 'mediaId': metadata1.id}, params).done(function() {
        ok(true, 'successful get media');
      }).error(function() {
        // Force fail
        ok(false, 'get all media metadata failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    'get media file using maxWidth',

    function() {
      var url = apiUrl + '/' + channel + '/media/' + metadata1.id;

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?maxWidth=100',
                         [200,
                         {
                          'content-type': metadata1.mimeType,
                          'content-length:': metadata1.fileSize,
                          'cache-control': 'max-age=86400, public',
                          'server': 'buddycloud media server'
                         }, '']);

      var params = {maxWidth: 100};
      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: params
      };

      buddycloud.Media.get({'channel': channel, 'mediaId': metadata1.id}, params).done(function() {
        ok(true, 'successful get media');
      }).error(function() {
        // Force fail
        ok(false, 'get all media metadata failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    'get media file using maxHeight and maxWidth',

    function() {
      var url = apiUrl + '/' + channel + '/media/' + metadata1.id;

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?maxHeight=100&maxWidth=50',
                         [200,
                         {
                          'content-type': metadata1.mimeType,
                          'content-length:': metadata1.fileSize,
                          'cache-control': 'max-age=86400, public',
                          'server': 'buddycloud media server'
                         }, '']);

      var params = {maxHeight: 100, maxWidth: 50};
      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: params
      };

      buddycloud.Media.get({'channel': channel, 'mediaId': metadata1.id}, params).done(function() {
        ok(true, 'successful get media');
      }).error(function() {
        // Force fail
        ok(false, 'get all media metadata failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  // buddycloud.Media.add

  function blobFile() {
    return {name: 'test.jpg', size: metadata1.fileSize, type: metadata1.mimeType};
  }

  test(
    'add blob file media',

    function() {
      var url = apiUrl + '/' + channel + '/media';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', url,
                         [201,
                         {'Content-Type': 'application/json'}, JSON.stringify(metadata1)]);

      var mediaFile = blobFile();
      var opt = {
        url: url,
        type: 'POST',
        xhrFields: {withCredentials: true},
        processData: false,
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: Util.buildFormData(mediaFile)
      };

      buddycloud.Media.add(channel, {'file': mediaFile}).done(function() {
        ok(true, 'successful upload media');
      }).error(function() {
        // Force fail
        ok(false, 'get all media metadata failure');
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
    'add Base64 media',

    function() {
      var url = apiUrl + '/' + channel + '/media';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', url,
                         [201,
                         {'Content-Type': 'application/json'}, JSON.stringify(metadata1)]);

      var mediaFile = base64File();
      var opt = {
        url: url,
        type: 'POST',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: {'data': mediaFile, 'content-type': 'image/jpeg'}
      };

      buddycloud.Media.add(channel, {'file': mediaFile, 'content-type': 'image/jpeg'}).done(function() {
        ok(true, 'successful upload media');
      }).error(function() {
        // Force fail
        ok(false, 'get all media metadata failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

});