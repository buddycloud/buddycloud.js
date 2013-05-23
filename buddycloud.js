(function($, _){
  var root = this;

  var buddycloud = root.buddycloud = {};

  buddycloud.VERSION = '0.0.1';

  buddycloud._api = 'https://api.buddycloud.org';
  var _jid, _password, _email;

  function authHeader(jid, password) {
    if (jid && password) {
      return 'Basic ' + btoa(jid + ':' + password);
    }

    return ready() ? 'Basic ' + btoa(_jid + ':' + _password) : null;
  }

  function apiUrl() {
    var components = _.toArray(arguments);
    components.unshift(buddycloud._api);
    return components.join('/');
  }

  function updateCredentials(credentials) {
    _jid = credentials.jid;
    _password = credentials.password;
    _email = credentials.email;
  }

  var init = function(api) {
    if (api) {
      buddycloud._api = api;
    }
  };

  var reset = function() {
    updateCredentials({});
  };

  var ready = function() {
    return _jid && _password ? true : false;
  };

  // Assign to buddycloud

  buddycloud.init = init;
  buddycloud.ready = ready;
  buddycloud.reset = reset;

  buddycloud.Account = {
    create: function(credentials) {
      var data = {
        'username': credentials.jid,
        'password': credentials.password,
        'email': credentials.email
      };

      var endpoint = 'account';
      var opt = {
        url: apiUrl(endpoint),
        type: 'POST',
        data: JSON.stringify(data)
      };

      return $.ajax(opt);
    },

    update: function(credentials) {
      // TODO: Not implemented on API
    }
  };


  buddycloud.Auth = {
    login: function(jid, password) {
      var endpoint = 'login';
      var opt = {
        url: apiUrl(endpoint),
        type: 'POST',
        headers: {'Authorization': authHeader(jid, password)}
      };

      var promise = $.ajax(opt);
      promise.done(function() {
        updateCredentials({'jid': jid, 'password': password});
      }).error(function() {
        updateCredentials({});
      });

      return promise;
    }
  };

  buddycloud.Node = {
    create: function(channel, node) {
      var opt = {
        url: apiUrl(channel, node),
        type: 'POST',
        headers: {'Authorization': authHeader()}
      };

      return $.ajax(opt);
    }
  };

  buddycloud.Content = {
    get: function(path, params) {
      var channel = path.channel;
      var node = path.node;
      var item = path.item || '';

      var opt = {
        url: apiUrl(channel, node, item),
        type: 'GET',
        headers: {
          'Accept': 'aplication/json'
        }
      };

      if (ready()) {
        opt.headers['Authorization'] = authHeader();
      }

      if (!item && params) {
        // Only supported params
        if (params.max && params.after) {
          opt.data = params;
        }
      }

      return $.ajax(opt);
    },

    add: function(item) {
      var channel = item.channel;
      var node = item.node;
      var content = item.content;

      var opt = {
        url: apiUrl(channel, node),
        type: 'POST',
        headers: {
          'Authorization': authHeader(),
          'Accept': 'aplication/json'
        },
        data: JSON.stringify({'content': content}),
        dataType: 'json'
      };

      return $.ajax(opt);
    }
  };

}).call(this, jQuery, _);