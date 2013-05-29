//     buddycloud.js 0.0.1


 //     Copyright 2012 buddycloud
 //
 //     Licensed under the Apache License, Version 2.0 (the "License");
 //     you may not use this file except in compliance with the License.
 //     You may obtain a copy of the License at
 //
 //     http://www.apache.org/licenses/LICENSE-2.0
 //
 //     Unless required by applicable law or agreed to in writing, software
 //     distributed under the License is distributed on an "AS IS" BASIS,
 //     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 //     See the License for the specific language governing permissions and
 //     limitations under the License.


 (function(){


  // Initial Setup
  // -------------



  var root = this;

  var buddycloud = root.buddycloud = {};

  buddycloud.VERSION = '0.0.1';

  buddycloud.$ = root.jQuery || root.$;

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

    return ready() ? 'Basic ' + buddycloud.config.credentials : null;
  }

  function apiUrl() {
    var components = Array.prototype.slice.call(arguments);
    components.unshift(buddycloud.config.url);
    return components.join('/');
  }

  function updateCredentials(credentials) {
    buddycloud.config.jid = credentials.jid;
    buddycloud.config.credentials = btoa(credentials.jid + ':' + credentials.password);
    buddycloud.config.email = credentials.email;
  }

  function checkObject() {
    var args = Array.prototype.slice.call(arguments);
    var object = args.shift();
    if (!object) return false;

    var property = args.shift();
    while (property) {
      if (!object[property]) {
        return false;
      }

      property = args.shift();
    }

    return true;
  }

  function insertValidParameters() {
    var args = Array.prototype.slice.call(arguments);
    var options = args.shift();
    var params = args.shift();
    var next = args.shift();

    var temp = options.data || {};
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

  var init = function(config) {
    if (config.apiUrl) {
      buddycloud.config.url = config.apiUrl;
    }

    if (config.domain) {
      buddycloud.config.domain = config.domain;
    }
  };

  var reset = function() {
    buddycloud.config.jid = buddycloud.config.credentials = buddycloud.config.email = null;
  };

  var ready = function() {
    return buddycloud.config.jid && buddycloud.config.credentials ? true : false;
  };


  // Default Configuration
  // ---------------------



  buddycloud.config = {
    url: 'https://api.buddycloud.org',
    domain: 'buddycloud.org',
    jid: null,
    credentials: null,
    email: null,

    // Topic channels jid
    appendTopic: true,

    // Messages
    paramMissingErr: 'Parameters missing. Method usage: $1.',
    notLoggedErr: 'Must login first: buddycloud.Auth.login(jid, password).'
  };

  // Assign to buddycloud
  buddycloud.init = init;
  buddycloud.ready = ready;


  // buddycloud.Account
  // ------------------



  buddycloud.Account = {
    create: function(credentials) {
      if (!checkObject(credentials, 'jid', 'password', 'email')) {
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


  // buddycloud.Avatar
  // -----------------



  buddycloud.Avatar = {
    get: function(channel, params) {
      if (!(channel && typeof channel === 'string')) {
        raiseError(buddycloud.config.paramMissingErr, ['Avatar.get(channel[, {maxheight, maxwidth}])']);
      }

      var opt = {
        url: apiUrl(channel, 'media', 'avatar'),
        type: 'GET'
      };

      if (params) {
        insertValidParameters(opt, params, 'maxheight', 'maxwidth');
      }

      return ajax(opt);
    },

    set: function(channel, media) {
      if (!channel || !checkObject(media, 'file')) {
        raiseError(buddycloud.config.paramMissingErr, ['Avatar.set(channel, {file[, content-type, filename, title]})']);
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
        url: apiUrl(channel, 'media', 'avatar'),
        type: 'PUT',
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
    },

    remove: function(channel) {
      if (!channel) {
        raiseError(buddycloud.config.paramMissingErr, ['Avatar.remove(channel)']);
      }

      return buddycloud.Media.remove({'channel': channel, 'mediaId': 'avatar'});
    }
  };


  // buddycloud.Auth
  // ---------------



  buddycloud.Auth = {
    login: function(credentials) {
      if (!checkObject(credentials, 'jid', 'password')) {
        raiseError(buddycloud.config.paramMissingErr, ['Auth.login({jid, password})']);
      }

      var jid = credentials.jid;
      var password = credentials.password;

      var opt = {
        url: apiUrl(),
        type: 'GET',
        headers: {'Authorization': authHeader(jid, password)}
      };

      var promise = ajax(opt);
      promise.done(function() {
        updateCredentials({'jid': jid, 'password': password});
      }).fail(function() {
        reset();
      });

      return promise;
    },

    logout: function() {
      // Reset credentials
      reset();
    }
  };


  // buddycloud.Channel
  // ------------------



  buddycloud.Channel = {
    create: function(channel) {
      if (!channel) {
        raiseError(buddycloud.config.paramMissingErr, ['Channel.create(channel)']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      // If channel jid not provided, append configured domain
      if (channel.indexOf('@') === -1) {
        var domain = buddycloud.config.domain;
        // Currently, the pattern in buddycloud is that not personal channels have "topic" on its jid
        channel += buddycloud.config.appendTopic ? '@topics' + domain : '@' + domain;
      }

      var opt = {
        url: apiUrl(channel),
        type: 'POST',
        headers: {
          'Authorization': authHeader()
        }
      };

      return ajax(opt);
    }
  };


  // buddycloud.Content
  // ------------------



  buddycloud.Content = {
    get: function(path, params) {
      if (!checkObject(path, 'channel', 'node')) {
        raiseError(buddycloud.config.paramMissingErr, ['Content.get({channel, node[, item]}[, {max, after}])']);
      }

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

      return ajax(opt);
    },

    add: function(item) {
      if (!checkObject(item, 'channel', 'node', 'content')) {
        raiseError(buddycloud.config.paramMissingErr, ['Content.add({channel, node, content})']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

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

      return ajax(opt);
    },

    remove: function(path) {
      if (!checkObject(path, 'channel', 'node', 'item')) {
        raiseError(buddycloud.config.paramMissingErr, ['Content.remove({channel, node, item})']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      var channel = path.channel;
      var node = path.node;
      var item = path.item;

      var opt = {
        url: apiUrl(channel, 'content', node, item),
        type: 'DELETE',
        headers: {
          'Authorization': authHeader()
        }
      };

      return ajax(opt);
    }
  };


  // buddycloud.Discovery
  // --------------------



  buddycloud.Discovery = {
    recommendations: function(channel, params) {
      if (!(channel && typeof channel === 'string')) {
        raiseError(buddycloud.config.paramMissingErr, ['Discovery.recommendations(channel[, {max, index}])']);
      }

      var opt = {
        url: apiUrl('recommendations'),
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        data: {'user': channel}
      };

      if (params) {
        insertValidParameters(opt, params, 'max', 'index');
      }

      return ajax(opt);
    },

    similar: function(channel, params) {
      if (!(channel && typeof channel === 'string')) {
        raiseError(buddycloud.config.paramMissingErr, ['Discovery.similar(channel[, {max, index}])']);
      }

      var opt = {
        url: apiUrl(channel, 'similar'),
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      if (params) {
        insertValidParameters(opt, params, 'max', 'index');
      }

      return ajax(opt);
    },

    search: function(query) {
      if (!checkObject(query, 'type', 'q')) {
        raiseError(buddycloud.config.paramMissingErr, ['Discovery.search({type, q[, max, index]})']);
      }

      var opt = {
        url: apiUrl('search'),
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      insertValidParameters(opt, query, 'type', 'q', 'max', 'index');

      return ajax(opt);
    },

    mostActive: function(params) {
      var opt = {
        url: apiUrl('most_active'),
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      if (params) {
        insertValidParameters(opt, params, 'max', 'index');
      }

      return ajax(opt);
    }
  };


  // buddycloud.Media
  // ----------------



  buddycloud.Media = {
    getMetadata: function(channel, params) {
      if (!(channel && typeof channel === 'string')) {
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
      if (!checkObject(media, 'channel', 'mediaId')) {
        raiseError(buddycloud.config.paramMissingErr, ['Media.get({channel, mediaId}[, {maxheight, maxwidth}])']);
      }

      var channel = media.channel;
      var mediaId = media.mediaId;

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
      if (!(channel && typeof channel === 'string') || !checkObject(media, 'file')) {
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
    },

    remove: function(media) {
      if (!checkObject(media, 'channel', 'mediaId')) {
        raiseError(buddycloud.config.paramMissingErr, ['Media.remove({channel, mediaId})']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      var channel = media.channel;
      var mediaId = media.mediaId;

      var opt = {
        url: apiUrl(channel, 'media', mediaId),
        type: 'DELETE',
        headers: {
          'Authorization': authHeader()
        }
      };

      return ajax(opt);
    }
  };


  // buddycloud.Metadata
  // -------------------



  buddycloud.Metadata = {
    get: function(path) {
      if (!checkObject(path, 'channel', 'node')) {
        raiseError(buddycloud.config.paramMissingErr, ['Metadata.get({channel, node})']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      var channel = path.channel;
      var node = path.node;

      var opt = {
        url: apiUrl(channel, 'metadata', node),
        type: 'GET',
        headers: {'Accept': 'application/json'}
      };

      return ajax(opt);
    },

    update: function(path, metadata) {
      if (!checkObject(path, 'channel', 'node') || !checkObject(metadata, 'title', 'description', 'access_model', 'default_affiliation')) {
        raiseError(buddycloud.config.paramMissingErr, ['Metadata.update({channel, node}, {title, description, access_model, default_affiliation})']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      var channel = path.channel;
      var node = path.node;

      var opt = {
        url: apiUrl(channel, 'metadata', node),
        type: 'POST',
        headers: {
          'Authorization': authHeader()
        },
        data: JSON.stringify(metadata)
      };

      return ajax(opt);
    }
  };


  // buddycloud.Node
  // ---------------



  buddycloud.Node = {
    create: function(path) {
      if (!checkObject(path, 'channel', 'node')) {
        raiseError(buddycloud.config.paramMissingErr, ['Node.create({channel, node})']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      var channel = path.channel;
      var node = path.node;

      var opt = {
        url: apiUrl(channel, node),
        type: 'POST',
        headers: {'Authorization': authHeader()}
      };

      return ajax(opt);
    }
  };


  // buddycloud.NotificationSettings
  // -------------------------------



  buddycloud.NotificationSettings = {
    get: function(type) {
      if (!type) {
        raiseError(buddycloud.config.paramMissingErr, ['NotificationSettings.get(type)']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      var opt = {
        url: apiUrl('notification_settings'),
        type: 'GET',
        headers: {
          'Authorization': authHeader(),
          'Accept': 'application/json'
        },
        data: {'type': type}
      };

      return ajax(opt);
    },

    update: function(settings) {
      if (!checkObject(settings, 'type', 'target', 'postAfterMe', 'postMentionedMe', 'postOnMyChannel',
        'postOnSubscribedChannel', 'followMyChannel', 'followRequest')) {

        raiseError(buddycloud.config.paramMissingErr, ['NotificationSettings.update({type, target, postAfterMe,' +
        ' postMentionedMe, postOnMyChannel, postOnSubscribedChannel, followMyChannel, followRequest})']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      var opt = {
        url: apiUrl('notification_settings'),
        type: 'POST',
        headers: {
          'Authorization': authHeader(),
          'Accept': 'application/json'
        },
        data: JSON.stringify(settings)
      };

      return ajax(opt);
    }
  };


  // buddycloud.Subscribed
  // ---------------------



  buddycloud.Subscribed = {
    get: function() {
      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      var opt = {
        url: apiUrl('subscribed'),
        type: 'GET',
        headers: {
          'Authorization': authHeader(),
          'Accept': 'application/json'
        }
      };

      return ajax(opt);
    },

    update: function(subscriptions) {
      if (!subscriptions) {
        raiseError(buddycloud.config.paramMissingErr, ['Subscribed.update(subscriptions)']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      var opt = {
        url: apiUrl('subscribed'),
        type: 'POST',
        headers: {
          'Authorization': authHeader()
        },
        data: JSON.stringify(subscriptions)
      };

      return ajax(opt);
    }
  };


  // buddycloud.Subscribers
  // ----------------------



  buddycloud.Subscribers = {
    get: function(path) {
      if (!checkObject(path, 'channel', 'node')) {
        raiseError(buddycloud.config.paramMissingErr, ['Subscribers.get({channel, node})']);
      }

      var channel = path.channel;
      var node = path.node;

      var opt = {
        url: apiUrl(channel, 'subscribers', node),
        type: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      if (ready()) {
        opt.headers['Authorization'] = authHeader();
      }

      return ajax(opt);
    }
  };


  // buddycloud.Sync
  // ---------------



  buddycloud.Sync = {
    get: function(params) {
      if (!checkObject(params, 'node', 'since', 'max')) {
        raiseError(buddycloud.config.paramMissingErr, ['Sync.get({node, since, max[, counters]})']);
      }

      if (!ready()) {
        raiseError(buddycloud.config.notLoggedErr);
      }

      var node = params.node;
      var since = params.since;
      var max = params.max;
      var counters = params.counters;

      var opt = {
        url: apiUrl(node, 'sync'),
        type: 'GET',
        headers: {
          'Authorization': authHeader(),
          'Accept': 'application/json'
        },
        data: {'since': since, 'max': max}
      };

      if (counters && (counters === true || counters === 'true')) {
        opt.data.counters = counters;
      }

      return ajax(opt);
    }
  };

}).call(this);