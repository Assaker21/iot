const { subscribe } = require("./connection.mqtt");

const topics = [];

function addTopic(topic) {
  topics.push(topic);
}

function addTopics(topics) {
  topics.forEach((topic) => addTopic(topic));
}

function removeTopic(topic) {
  const index = topics.findIndex((t) => t == topic);
  topics.splice(index, 1);
}

function addTopicAndSubscribe(topic) {
  addTopic(topic);
  subscribe(topic);
}

function getTopics() {
  return topics;
}

module.exports = {
  addTopic,
  addTopics,
  removeTopic,
  getTopics,
  addTopicAndSubscribe,
};
