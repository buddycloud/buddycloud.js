(function($, _){
  var root = this;

  var buddycloud = root.buddycloud = {};

  buddycloud.VERSION = '0.0.1';

  function authHeader(jid, password) {
    if (jid && password) {
      return 'Basic ' + btoa(jid + ':' + password);
    }

    return ready() ? 'Basic ' + btoa(buddycloud.config.jid + ':' + buddycloud.config.password) : null;
  }

  function apiUrl() {
    var components = _.toArray(arguments);
    components.unshift(buddycloud.config.api);
    return components.join('/');
  }

  function updateCredentials(credentials) {
    buddycloud.config.jid = credentials.jid;
    buddycloud.config.password = credentials.password;
    buddycloud.config.email = credentials.email;
  }

  function insertValidParameters() {
    var args = _.toArray(arguments);
    var options = args.shift();
    var params = args.shift();
    var next = args.shift();

    var temp = {};
    while (next) {
      for (var property in params) {
        if (property.toLowerCase() === next) {
          temp[property] = params[property];
          break;
        }
      }

      next = args.shift();
    }

    if (!$.isEmptyObject(temp)) {
      options.data = temp;
    }
  }

  function buildFormData(file, metadata) {
    var formData = new FormData();
    formData.append('data', file);
    if (file.type) {
      formData.append('content-type', file.type);
    }
    if (file.name) {
      formData.append('filename', file.name);
    }

    for (var property in metadata) {
      formData.append(property, metadata[property]);
    }

    return formData;
  }

  function buildWebForm(file, metadata) {
    var data = {};
    data['data'] = file;

    for (var property in metadata) {
      data[property] = metadata[property];
    }

    return data;
  }

  var init = function(api) {
    if (api) {
      buddycloud.config.api = api;
    }
  };

  var reset = function() {
    updateCredentials({});
  };

  var ready = function() {
    return buddycloud.config.jid && buddycloud.config.password ? true : false;
  };

  // Default configuration
  var DefaultConfig = buddycloud.config = {
    url: 'https://api.buddycloud.org',
    jid: null,
    password: null,
    email: null,

    // Messages
    responseError: 'Server responded with {{statusCode}} code.'
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
        reset();
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
        url: apiUrl(channel, 'content', node, item),
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      if (ready()) {
        opt.headers['Authorization'] = authHeader();
      }

      // Parameters only allowed for all content
      if (!item && params) {
        // Only supported params
        insertValidParameters(opt, params, 'max', 'after');
      }

      return $.ajax(opt);
    },

    add: function(item) {
      var channel = item.channel;
      var node = item.node;
      var content = item.content;

      var opt = {
        url: apiUrl(channel, 'content', node),
        type: 'POST',
        headers: {
          'Authorization': authHeader(),
          'Accept': 'application/json'
        },
        data: JSON.stringify({'content': content}),
        dataType: 'json'
      };

      return $.ajax(opt);
    }
  };

  buddycloud.Media = {
    get: function(path, params) {
      var channel = path.channel;
      var mediaId = path.mediaId || '';

      var opt = {
        url: apiUrl(channel, 'media', mediaId),
        type: 'GET',
        headers: {
          'Authorization': authHeader(),
          'Accept': 'application/json'
        }
      };

      if (params) {
        if (mediaId) {
          insertValidParameters(opt, params, 'maxheight', 'maxwidth');
        } else {
          insertValidParameters(opt, params, 'max', 'after');
        }
      }

      return $.ajax(opt);
    },
    add: function(channel, media) {
      var file = media.file;
      var metadata = {};
      for (var property in media) {
        if (property !== 'file') {
          metadata[property] = media[property];
        }
      }

      var opt = {
        url: apiUrl(channel, 'media'),
        type: 'POST',
        xhrFields: {withCredentials: true},
        headers: {
          'Authorization': authHeader(),
          'Accept': 'application/json'
        }
      };

      // Check wheter it is a Base64 file
      if (typeof file === 'string') {
        opt.data = buildWebForm(file, metadata);
      } else {
        // Should be a blob file
        opt.processData = false;
        opt.data = buildFormData(file, metadata);
      }

      return $.ajax(opt);
    }
  };
}).call(this, jQuery, _);