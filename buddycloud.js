(function(){
  var root = this;

  var buddycloud = root.buddycloud = {};

  buddycloud.VERSION = '0.0.1';

  buddycloud.$ = root.jQuery || root.Zepto || root.ender || root.$;

  function ajax(opt) {
    if (opt.headers && opt.headers['Authorization']) {
      opt.xhrFields = opt.xhrFields || {};
      opt.xhrFields['withCredentials'] = true;
    }
    return buddycloud.$.ajax(opt);
  }

  function authHeader(jid, password) {
    if (jid && password) {
      return 'Basic ' + btoa(jid + ':' + password);
    }

    return ready() ? 'Basic ' + btoa(buddycloud.config.jid + ':' + buddycloud.config.password) : null;
  }

  function apiUrl() {
    var components = Array.prototype.slice.call(arguments);
    components.unshift(buddycloud.config.url);
    return components.join('/');
  }

  function updateCredentials(credentials) {
    buddycloud.config.jid = credentials.jid;
    buddycloud.config.password = credentials.password;
    buddycloud.config.email = credentials.email;
  }

  function insertValidParameters() {
    var args = Array.prototype.slice.call(arguments);
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

    if (Object.keys(temp).length > 0) {
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

  function raiseError(message, placeHolders) {
    throw new Error(errorMessage(message, placeHolders));
  }

  function errorMessage(message, placeHolders) {
    var pIndex = 1;
    for (var i in placeHolders) {
      message = message.replace('$' + pIndex, placeHolders[i]);
      pIndex++;
    }

    return message;
  }

  var init = function(api) {
    if (api) {
      buddycloud.config.url = api;
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
    paramMissingErr: 'Parameters missing. Method usage: $1.',
    notLoggedErr: 'Must login first: buddycloud.Auth.login(jid, password).'
  };

  // Assign to buddycloud
  buddycloud.init = init;
  buddycloud.ready = ready;
  buddycloud.reset = reset;

  buddycloud.Account = {
    create: function(credentials) {
      if (!credentials.jid || !credentials.password || !credentials.email) {
        raiseError(buddycloud.config.paramMissingErr, ['Account.create({jid, password, email})']);
      }

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

      return ajax(opt);
    },

    update: function(credentials) {
      // TODO: Not implemented on API
    }
  };


  buddycloud.Auth = {
    login: function(jid, password) {
      if (!jid || !password) {
        raiseError(buddycloud.config.paramMissingErr, ['Auth.login(jid, password)']);
      }

      var opt = {
        url: apiUrl(),
        type: 'GET',
        headers: {'Authorization': authHeader(jid, password)}
      };

      var promise = ajax(opt);
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
      if (!channel || !node) {
        raiseError(buddycloud.config.paramMissingErr, ['Node.create(channel, node)']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      var opt = {
        url: apiUrl(channel, node),
        type: 'POST',
        headers: {'Authorization': authHeader()}
      };

      return ajax(opt);
    }
  };

  buddycloud.Content = {
    get: function(path, params) {
      var channel = path.channel;
      var node = path.node;
      var item = path.item || '';

      if (!channel || !node) {
        raiseError(buddycloud.config.paramMissingErr, ['Content.get({channel, node[, item]}[, {max, after}])']);
      }

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

      return ajax(opt);
    },

    add: function(item) {
      var channel = item.channel;
      var node = item.node;
      var content = item.content;

      if (!channel || !node || !content) {
        raiseError(buddycloud.config.paramMissingErr, ['Content.add({channel, node, content})']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

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

      return ajax(opt);
    }
  };

  buddycloud.Media = {
    getMetadata: function(channel, params) {
      if (!channel) {
        raiseError(buddycloud.config.paramMissingErr, ['Media.getMetadata(channel[,{max, after}])']);
      }

      var opt = {
        url: apiUrl(channel, 'media'),
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      if (ready()) {
        opt.headers['Authorization'] = authHeader();
      }

      if (params) {
        insertValidParameters(opt, params, 'max', 'after');
      }

      return ajax(opt);
    },

    get: function(media, params) {
      var channel = media.channel;
      var mediaId = media.mediaId;

      if (!channel || !mediaId) {
        raiseError(buddycloud.config.paramMissingErr, ['Media.get({channel, mediaId}[, {maxheight, maxwidth}])']);
      }

      var opt = {
        url: apiUrl(channel, 'media', mediaId),
        type: 'GET'
      };

      if (ready()) {
        opt.headers = {'Authorization': authHeader()};
      }

      if (params) {
        insertValidParameters(opt, params, 'maxheight', 'maxwidth');
      }

      return ajax(opt);
    },

    add: function(channel, media) {
      if (!channel || !media || !media.file) {
        raiseError(buddycloud.config.paramMissingErr, ['Media.add(channel, {file[, content-type, filename, title]})']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

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

      return ajax(opt);
    }
  };
}).call(this);