$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var domain = 'TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };
  var channel = 'test@topics.TEST.COM';

  module('buddycloud.Discovery', {
    setup: function() {
      Util.init(apiUrl, domain, user);
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

  //buddycloud.Discovery.similar

  var similar = {
      items: [{
        jid: 'test1@TEST1.COM',
        description: 'TEST 1.',
        creationDate: '2013-01-01T17:08:51+0000',
        title: 'test1@TEST1.COM Channel Posts',
        channelType: 'personal',
        defaultAffiliation: 'publisher'
    }, {
        jid: 'test2@TEST2.COM',
        description: 'TEST 2.',
        creationDate: '2013-01-02T17:08:51+0000',
        title: 'test2@TEST2.COM Channel Posts',
        channelType: 'personal',
        defaultAffiliation: 'follower'
    } ],
      rsm: {
        index: '0',
        count: '2'
    }};

  test(
    '.similar(): get similar channels',

    function() {
      var url = apiUrl + '/' + channel + '/similar';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(similar)]);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      buddycloud.Discovery.similar(channel).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(similar), 'similar channels successfully retrieved');
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
    '.similar(): get similar channels with max param',

    function() {
      var url = apiUrl + '/' + channel + '/similar';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?max=2',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(similar)]);

      var params = {max: 2};

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        data: params
      };

      buddycloud.Discovery.similar(channel, params).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(similar), 'similar channels successfully retrieved');
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
    '.similar(): get similar channels using params',

    function() {
      var url = apiUrl + '/' + channel + '/similar';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?max=2&index=2',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(similar)]);

      var params = {max: 2, index: 2};

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        data: params
      };

      buddycloud.Discovery.similar(channel, params).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(similar), 'similar channels successfully retrieved');
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
    '.similar(): get similar channels using not supported params',

    function() {
      var url = apiUrl + '/' + channel + '/similar';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(similar)]);

      var params = {abc: 2, def: 2};

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      buddycloud.Discovery.similar(channel, params).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(similar), 'similar channels successfully retrieved');
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
    '.similar(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.Discovery.similar({max: 2, index:0});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Discovery.similar(channel[, {max, index}])');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.similar(): using no parameters',

    function() {
      throws(
        function() {
          buddycloud.Discovery.similar();
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Discovery.similar(channel[, {max, index}])');
        },
        'throws required parameters error'
      );
    }
  );

  //buddycloud.Discovery.search

  var searchMetadataResult = similar;
  var searchContentResult = {
      items: [{
        id: 'd0996931',
        author: 'test2@TEST2.COM',
        content: 'blablablabla',
        updated: '2013-04-13T09:33:36+0000',
        published: '2013-04-13T09:33:36+0000',
        parent_fullid: '/user/test1@TEST1.com/posts',
        parent_simpleid: 'test1@TEST1.com',
        in_reply_to: null
      }, {
        id: 'g6773905',
        author: 'test1@TEST1.COM',
        content: 'blablablabla',
        updated: '2013-04-13T09:34:36+0000',
        published: '2013-04-13T09:34:36+0000',
        parent_fullid: '/user/test1@TEST1.com/posts',
        parent_simpleid: 'test1@TEST1.com',
        in_reply_to: 'd0996931'
    } ],
      rsm: {
        index: '0',
        count: '2'
    }};

  test(
    '.search(): search content',

    function() {
      var url = apiUrl + '/search';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?type=content&q=test',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(searchContentResult)]);

      var query = {type: 'content', q: 'test'};

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        data: query
      };

      buddycloud.Discovery.search(query).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(searchContentResult), 'successful search');
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
    '.search(): search content',

    function() {
      var url = apiUrl + '/search';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?type=metadata&q=test',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(searchMetadataResult)]);

      var query = {type: 'metadata', q: 'test'};

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        data: query
      };

      buddycloud.Discovery.search(query).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(searchMetadataResult), 'successful search');
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
    '.search(): search content using params',

    function() {
      var url = apiUrl + '/search';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?type=metadata&q=test&max=2&index=0',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(searchMetadataResult)]);

      var query = {type: 'metadata', q: 'test', max: 2, index: 0};

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        data: query
      };

      buddycloud.Discovery.search(query).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(searchMetadataResult), 'successful search');
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
    '.search(): passing invalid type',

    function() {
      var url = apiUrl + '/search';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?type=abc&q=test&max=2&index=0',
                         [500, {'Content-Type': 'text/plain'}, 'Internal Server Error']);

      var query = {type: 'abc', q: 'test', max: 2, index: 0};

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        data: query
      };

      buddycloud.Discovery.search(query).done(function(data) {
        ok(false, 'unexpected success');
      }).fail(function() {
        ok(true, 'search error');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.search(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.Discovery.search({max: 2, index:0});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Discovery.search({type, q[, max, index]})');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.search(): using no parameters',

    function() {
      throws(
        function() {
          buddycloud.Discovery.search();
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Discovery.search({type, q[, max, index]})');
        },
        'throws required parameters error'
      );
    }
  );

  //buddycloud.Discovery.mostActive

  var mostActive = similar;

  test(
    '.mostActive(): get most active channels',

    function() {
      var url = apiUrl + '/most_active';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(mostActive)]);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      buddycloud.Discovery.mostActive().done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(mostActive), 'most active successfully retrieved');
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
    '.mostActive(): get most active channels using params',

    function() {
      var url = apiUrl + '/most_active';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?max=2&index=0',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(mostActive)]);

      var params = {max: 2, index: 0};

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        data: params
      };

      buddycloud.Discovery.mostActive(params).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(mostActive), 'most active successfully retrieved');
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
    '.mostActive(): get most active channels using invalid params',

    function() {
      var url = apiUrl + '/most_active';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(mostActive)]);

      var params = {abc: 2, def: 0};

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      buddycloud.Discovery.mostActive(params).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(mostActive), 'most active successfully retrieved');
      }).fail(function() {
        // Force fail
        ok(false, 'unexpected failure');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  //buddycloud.Discovery.recommendations

  var recommendations = similar;

  test(
    '.recommendations(): get recommendations for a channels',

    function() {
      var url = apiUrl + '/recommendations';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?user=user%40TEST.COM',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(recommendations)]);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        data: {'user': user.jid}
      };

      buddycloud.Discovery.recommendations(user.jid).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(recommendations), 'recommendations successfully retrieved');
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
    '.recommendations(): get recommendations using params',

    function() {
      var url = apiUrl + '/recommendations';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?user=user%40TEST.COM&max=2&index=2',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(similar)]);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        data: {'user': user.jid, max: 2, index: 2}
      };

      buddycloud.Discovery.recommendations(user.jid, {max: 2, index: 2}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(similar), 'recommendations successfully retrieved');
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
    '.recommendations(): get recommendations using invalid params',

    function() {
      var url = apiUrl + '/recommendations';

      // Mock HTTP API server
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?user=user%40TEST.COM',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(similar)]);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        data: {'user': user.jid}
      };

      buddycloud.Discovery.recommendations(user.jid, {abc: 2, def: 2}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(similar), 'recommendations successfully retrieved');
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
    '.recommendations(): not using required parameters',

    function() {
      throws(
        function() {
          buddycloud.Discovery.recommendations({max: 2, index:0});
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Discovery.recommendations(channel[, {max, index}])');
        },
        'throws required parameters error'
      );
    }
  );

  test(
    '.recommendations(): using no parameters',

    function() {
      throws(
        function() {
          buddycloud.Discovery.recommendations();
        },
        function(error) {
          return error.message === Util.paramMissingMessage('Discovery.recommendations(channel[, {max, index}])');
        },
        'throws required parameters error'
      );
    }
  );
});