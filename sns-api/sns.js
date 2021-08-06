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
      Attributes: {
        // Sets the DisplayName, particularly useful for the email messages
        'DisplayName': topicName,
      },
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

const publishMessage = async ({ body }) => {
  /**
   * Publishes a message all subscribers of an SNS topic
   * @summary Takes message and an (optional) subject and publishes that message to an SNS topic
   * @param {String} event.body.topicArn - Arn of the topic
   * @param {String} event.body.message - Message that would be published
   * @param {String} event.body.subject - Subject text - mainly used for email subscriptions
   * @param {String} event.body.senderId - Sender ID - mainly used for the SMS sender id
   * @return {JSON} Returns a statusCode, a body that contains a message, response or an Error.
   */
  try {
    const { message, topicArn, subject, senderId } = JSON.parse(body);
    // Parses the senderId:
    //  - must be 1-11 alpha-numeric characters, no spaces
    const parsedSenderId = senderId && senderId.substring(0, 11).split(' ').join('').toUpperCase();
    // Set the publish params
    const publishParams = {
      Message: message /* required */,
      Subject: subject,
      TopicArn: topicArn,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          'DataType': 'String',
          'StringValue': parsedSenderId  
        }    
      } 
    };
    // Publish the message
    const res = await sns.publish(publishParams).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: `Succesfully sent message to topic!`,
          res,
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
          message: `Could not publish message.`,
          err,
        },
        null,
        2
      ),
    };
  }
};

module.exports = {
  createTopic,
  subscribeToTopic,
  publishMessage,
};
