buddycloud.js
=============

buddycloud.js: a channel wrangler using [XMPP-FTW](https://xmpp-ftw.jit.su).

## Setup

Include `buddycloud.js` in your project
```javascript
<script type="text/javascript" src="https://example.com/js/buddycloud.js"></script>
```

### Configure the API endpoint
```javascript
// This is the websocket endpoint (with a fallback to long-polling)
// You can look-up the endpoint for your site at https://protocol.buddycloud.com
define('API-ENDPOINT', 'https://example.com/api/');
define('REGISTER-REQUIRE-EMAIL', 'false');
define('GLOBAL-SEARCH-COMPONENT', 'search.buddycloud.org');

### Calling buddycloud.js

```javascript
// We register for the 'on load' event of of the page???
...
```

# Using

We should explain something to the user about receiving events here. Or tell the user what the buddycloud.js equivalent is of "sending presnece" is.

## Users

Buddycloud usernames look like `username@domain.com`. 

> problem cases: developers try to register just `user` instead of `user@domain`
> if the site requires and email, should this be a config variable?
> should also create /user/user@domain/posts node?

### Registering a user

> we should also create their personal channel at the sametime?

To register a new user on your Buddycloud domain, run the following code.

```javascript
ServerHandler.register({
	“username”: “username@domain.com”,
	“password”: “secret”
}).then(function(data){
	alert(data);
});
```

The server will reply with `xxx`. You now have a registered user.

### Remote a user
> removes their personal channel by default
> removes their `xmpp account`

To remove a user run the following code
```javascript
// code
```

## Channels
There are three types of channels
* personal (like your Facebook wall)
* topic (like a facebook group)
* ephemeral (designed for group chat - and disappear when the last user leaves)

### Create a channel
> go for a create-and-invite atomic operation
> create should include the following inputs: type-of-channel, metadata, invites, optional: node-name

### Delete a channel
- removes posts

## Posts
### Get posts
### Create post
### Remove posts
## Channel Subscriptions
### Get subscriptions
### Change subscriptions
## Followers
### change follower role
### invite follower
> or is this part of a channel creation? Think here make more sense. 
## Media
## Search
> parameters: on-server, remote
