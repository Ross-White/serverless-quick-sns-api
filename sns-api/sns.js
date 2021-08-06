"use strict";

const AWS = require("aws-sdk");

const sns = new AWS.SNS();

const createTopic = async ({ body }) => {
  /**
   * Creates an SNS topic 
   * @summary Takes a name and creates an SNS topic
   * @param {String} event.body.topicName - Name of the topic
   * @return {JSON} Returns a statusCode, a body that contains a message, topicArn or an Error.
   */
  try {
    const { topicName } = JSON.parse(body);
    const createTopicParams = {
      Name: topicName /* required */,
    };
    const res = await sns.createTopic(createTopicParams).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: `Succesfully create topic with the following name, ${topicName}`,
          topicArn: res.TopicArn,
        },
        null,
        2
      ),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: `Could not create topic.`,
          err,
        },
        null,
        2
      ),
    };
  }
};

const subscribeToTopic = async ({ body }) => {
  /**
   * Subscribes endpoints to a topic
   * @summary Takes a topic and endpoints (email, phone) and ubscribes those endpoints to the SNS topic
   * @param {String} event.body.topicArn - The arn for the topic, the address of the topic
   * @param {Array[Endpoint]} event.body.endpoints - A list of all the endpoints to be subscribed, an Enpoint object contains type (String, 'email' || 'sms') and a value (String)
   * @return {JSON} Returns a statusCode, a body that contains a message, or an Error.
   */
  try {
    // Define protocols
    const protocol = {
      email: "email",
      sms: "sms",
    };
    // Parse the body
    const { topicArn, endpoints } = JSON.parse(body);
    // Build up the subscription promisses
    const promisses = endpoints.map(async (endpoint) => {
      // Define subscribe parameters
      const subscribeParams = {
        Protocol: protocol[endpoint.type] /* required */,
        TopicArn: topicArn /* required */,
        Endpoint: endpoint.value,
        ReturnSubscriptionArn: false,
      };
      // Trigger and return the subscribe method
      const res = await sns.subscribe(subscribeParams).promise();
      return res;
    });
    // Fire all the promises and wait for them
    const subscriptionResponses = await Promise.all(promisses);
    // Return a responsee
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: `Succesfully subscribed endpoints!`,
          responses: subscriptionResponses,
        },
        null,
        2
      ),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: `Subscription was unsuccesful for.`,
          err,
        },
        null,
        2
      ),
    };
  }
};

// TODO: add message function using this example https://github.com/serverless/examples/blob/cf08befc3925b8558229af1a987d05a2aadbf8ff/aws-node-text-analysis-via-sns-post-processing/addNote.js

module.exports = {
  createTopic,
  subscribeToTopic,
};
