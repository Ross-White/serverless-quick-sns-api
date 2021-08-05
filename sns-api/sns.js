'use strict';

const AWS = require('aws-sdk');

const sns = new AWS.SNS();

const createTopic = async ({ body }) => {
    const { topicName } = JSON.parse(body);
    const createTopicParams = {
        Name: topicName, /* required */
    };
    const res = await sns.createTopic(createTopicParams).promise();
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: `Succesfully create topic with the following name, ${topicName}`,
                topicArn: res.TopicArn
            },
            null,
            2
        ),
    };
};

module.exports = {
    createTopic
}
