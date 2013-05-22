(function($, _){
  var root = this;

  var buddycloud = root.buddycloud = {};

  buddycloud.VERSION = '0.0.1';

  // Util private objects

  var Credentials = {
    authHeader: function() {
      return ready() ? 'Basic ' + btoa(this.jid + ':' + this.password) : null;
    }
  };

  var Config = {
    apiUrl: 'https://api.buddycloud.org',

    url: function() {
      var components = _.toArray(arguments);
      components.unshift(apiUrl);
      return components.join('/');
    }
  };

  // Util private functions

  var init = function(config) {
    Config.apiUrl = Config.apiUrl || config.apiUrl;
  };

  var ready = function() {
    return Credentials.jid && Credentials.password ? true : false;
  };

  var updateCredentials = function(credentials) {
    Credentials.jid = credentials.jid;
    Credentials.password = credentials.password;
    Credentials.email = credentials.email;
  };

  // Assign to buddycloud

  buddycloud.init = init;
  buddycloud.ready = ready;

  var Account = buddycloud.Account = {
    create: function(credentials) {
      var data = {
        'username': credentials.jid,
        'password': credentials.password,
        'email': credentials.email
      };

      var endpoint = 'account';
      var opt = {
        url: Config.url(endpoint),
        type: 'POST',
        'data': JSON.stringify(data)
      };

      var promise = $.ajax(opt);
      promise.done(function() {
        updateCredentials(credentials);
      });

      return promise;
    },

    update: function(credentials) {
      // TODO: Not implemented on API
    }
  };


  var Auth = buddycloud.Auth = {
    login: function(credentials) {
      var endpoint = 'login';
      var opt = {
        url: Config.url(endpoint),
        type: 'POST',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', Credentials.authHeader());
        }
      };

      var promise = $.ajax(opt);
      promise.done(function() {
        updateCredentials(credentials);
      });

      return promise;
    }
  };

  var Node = buddycloud.Node = {
    create: function(channel, node) {
      var opt = {
        url: Config.url(channel, node),
        type: 'POST',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Authorization', Credentials.authHeader());
        }
      };

      return $.ajax(opt);
    }
  };

}).call(this, jQuery, _);