(function($, _){
  var root = this;

  var buddycloud = root.buddycloud = {};

  buddycloud.VERSION = '0.0.1';

  buddycloud._api = 'https://api.buddycloud.org';
  var _jid, _password, _email;

  function authHeader() {
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
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', authHeader());
        }
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
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', authHeader());
        }
      };

      return $.ajax(opt);
    }
  };

}).call(this, jQuery, _);