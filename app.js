const dotenv = require('dotenv').config();
const tmi = require('tmi.js');
const util = require('util');

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true
  },
  identity: {
    username: 'acqueuebot',
    password: process.env.AUTH_TOKEN
  },
  channels: [process.env.CHANNEL]
});

var queue = [];
var backlog = [];

client.connect();

client.on('message', (channel, tags, message, self) => {
  var chan = dehash(channel);
  if (self) return;
  if (message.toLowerCase() === '!join') {
    if (userInBacklog(tags.username)) {
      client.say(channel, `@${tags.username}, You were in a previous queue please wait`);
    } else if (userInQueue(tags.username)) {
      client.say(channel, `@${tags.username}, You are already in the current queue`);
    } else if (queue.length == 5) {
      client.say(channel, `@${tags.username}, Queue is full`);
    } else {
      queue.push(tags.username)
      client.say(channel, `@${tags.username}, You have been added to the queue`);
    }
  }
  if (message.toLowerCase() === '!queue') {
    // if(queue.length == 4){
    //   client.say(channel, `@${tags.username}, Sorry the queue is full FeelsBadMan`);
    // }
    client.say(channel, `${queue.join(', ')}`);
  }

  if (message.toLowerCase() === '!backlog') {
    // if(queue.length == 4){
    //   client.say(channel, `@${tags.username}, Sorry the queue is full FeelsBadMan`);
    // }
    client.say(channel, `${backlog.join(', ')}`);
  }
  if (message.toLowerCase() === '!clear') {
    if (tags.username == chan) {
      if (isEmpty(queue)) {
        client.say(channel, `@${tags.username}, Queue is already empty`);
      } else {
        pushToBacklog()
        queue = [];
        client.say(channel, `@${tags.username}, Queue cleared`);
      }
    }
  }

  if (message.toLowerCase() === '!clear-all') {
    if (tags.username == chan) {
      queue = [];
      backlog = [];
      client.say(channel, `@${tags.username}, Queue and backlog cleared`);
    }
  }

  if (message.toLowerCase() === '!leave') {
    if (queue.indexOf(tags.username) != -1) {
      queue.splice(queue.indexOf(tags.username), 1);
    }
  }
});

function dehash(channel) {
  return channel.replace(/^#/, '');
}

function userInBacklog(user) {
  if (backlog.indexOf(user) != -1) {
    return true;
  } else {
    return false;
  }
}

function userInQueue(user) {
  if (queue.indexOf(user) != -1) {
    return true;
  } else {
    return false;
  }
}

function pushToBacklog() {
  if (backlog.length <= 25) {
    backlog = backlog.concat(queue);
  } else {
    backlog.splice(0, queue.length);
    backlog = backlog.concat(queue);
  }
}

function isEmpty(array) {
  if (array && array.length) {
    return false;
  } else {
    return true;
  }
}