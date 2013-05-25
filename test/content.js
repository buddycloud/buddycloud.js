$(document).ready(function() {
  'use strict';

  var apiUrl = 'https://api.TEST.COM';
  var user = {
    jid: 'user@TEST.COM',
    password: 'password'
  };
  var channel = 'test@topics.buddycloud.org';
  var node = 'posts';

  module('buddycloud.Content', {
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

  // buddycloud.Content.get

  var itemId = '123';
  var itemContent = 'abc';
  var item = {content: itemContent, id: itemId};
  var responseContent = [item,
                         {content: 'def', id: '456'},
                         {content: 'ghi', id: '789'}];

  test(
    '.get(): fetch all content from a channel',

    function() {
      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/content/' + node + '/';
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(responseContent)]);

      var opt = {
        url: url,
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        }
      };

      buddycloud.Content.get({'channel': channel, 'node': node}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(responseContent), 'successful get');
      }).error(function() {
        ok(false, 'unexpected error');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.get(): try to fetch all content without login',

    function() {
      buddycloud.reset();

      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/content/' + node + '/';
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(responseContent)]);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      buddycloud.Content.get({'channel': channel, 'node': node}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(responseContent), 'successful content retrieve');
      }).error(function() {
        ok(false, 'unexpected error');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.get(): fetch all content of a private channel without login',

    function() {
      buddycloud.reset();

      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/content/' + node + '/';
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [403, {'Content-Type': 'text/plain'}, 'Forbidden']);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      buddycloud.Content.get({'channel': channel, 'node': node}).done(function(data) {
        ok(false, 'unexpected success');
      }).error(function() {
        ok(true, 'error on get channel content');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.get(): fetch content using invalid parameters',

    function() {
      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/content/' + node + '/';
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(responseContent)]);

      var opt = {
        url: url,
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        }
      };

      buddycloud.Content.get({'channel': channel, 'node': node}, {abc: 1, 123: '000'}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(responseContent), 'successful content retrieve without parameters');
      }).error(function() {
        ok(false, 'unexpected error');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.get(): fetch content using parameters',

    function() {
      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/content/' + node + '/';
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?max=3&after=000',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(responseContent)]);

      var opt = {
        url: url,
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: {after: '000', max: 3}
      };

      buddycloud.Content.get({'channel': channel, 'node': node}, {max: 3, after: '000'}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(responseContent), 'successful content retrieve with parameters');
      }).error(function() {
        ok(false, 'unexpected error');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.get(): fetch content using just max parameter',

    function() {
      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/content/' + node + '/';
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url + '?max=3',
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(responseContent)]);

      var opt = {
        url: url,
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: {max: 3}
      };

      buddycloud.Content.get({'channel': channel, 'node': node}, {max: 3}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(responseContent), 'successful content retrieve with only max parameter');
      }).error(function() {
        ok(false, 'unexpected error');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.get(): fetch specific item',

    function() {
      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/content/' + node + '/' + itemId;
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(item)]);

      var opt = {
        url: url,
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        }
      };

      buddycloud.Content.get({'channel': channel, 'node': node, 'item': itemId}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(item), 'successful item retrieve');
      }).error(function() {
        ok(false, 'unexpected error');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.get(): fetch specific item without login',

    function() {
      buddycloud.reset();

      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/content/' + node + '/' + itemId;
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(item)]);

      var opt = {
        url: url,
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      buddycloud.Content.get({'channel': channel, 'node': node, 'item': itemId}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(item), 'successful item retrieve without login');
      }).error(function() {
        ok(false, 'unexpected error');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.get(): fetch specific item with not allowed params',

    function() {
      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/content/' + node + '/' + itemId;
      var server = this.sandbox.useFakeServer();
      server.respondWith('GET', url,
                         [200, {'Content-Type': 'application/json'}, JSON.stringify(item)]);

      var opt = {
        url: url,
        type: 'GET',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        }
      };

      buddycloud.Content.get({'channel': channel, 'node': node, 'item': itemId}, {max: 2}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(item), 'successful item retrieve item without parameters');
      }).error(function() {
        ok(false, 'unexpected error');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  // buddycloud.Content.add
  test(
    '.add(): add item to channel content',

    function() {
      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/content/' + node;
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', url,
                         [201, {'Content-Type': 'application/json'}, JSON.stringify(item)]);

      var opt = {
        url: url,
        type: 'POST',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: JSON.stringify({'content': itemContent}),
        dataType: 'json'
      };

      buddycloud.Content.add({'channel': channel, 'node': node, 'content': itemContent}).done(function(data) {
        equal(JSON.stringify(data), JSON.stringify(item), 'item successfully appended to content');
      }).error(function() {
        ok(false, 'unexpected error');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );

  test(
    '.add(): try to add item to not allowed channel content',

    function() {
      // Mock HTTP API server
      var url = apiUrl + '/' + channel + '/content/' + node;
      var server = this.sandbox.useFakeServer();
      server.respondWith('POST', url,
                         [403, {'Content-Type': 'text/plain'}, 'Forbidden']);

      var opt = {
        url: url,
        type: 'POST',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': Util.authHeader(user.jid, user.password),
          'Accept': 'application/json'
        },
        data: JSON.stringify({'content': itemContent}),
        dataType: 'json'
      };

      buddycloud.Content.add({'channel': channel, 'node': node, 'content': itemContent}).done(function() {
        ok(false , 'unexpected success');
      }).error(function() {
        ok(true, 'item not appended to channel content');
      }).always(function() {
        checkAjax(opt);
      });

      server.respond();
    }
  );
});