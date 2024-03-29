# Serverless - Quick SNS api

> A speedy way to intract with SNS via Lambda using a Serverless scaffold

## Checklist

* [ ] Prerequisites:
    * [ ] Install the `aws-cli`
* [ ] [Install serverless from the quick start guide](https://www.serverless.com/framework/docs/getting-started/) and follow the wizard
    * If you already have an IAM account setup locally you can skip some steps
    * If you want to update your `aws-cli` credentials you can find the details in `~/.aws/credentials`
    * Use the node api sample `AWS - Node.js - Starter`
    * [ ] Update the provider
        * [ ] Set the correct region
        * [ ] Set the correct stage
* [ ] Deploy your new sls project with 
    ```
    serverless deploy
    ```
    * Check the stack deployment by looking for the stack (sls service name) in the AWS Console / CloudFormation
    * Check what resources were created by the stack
    * Lambda can now be executed, but it has no triggers
* [ ] Add an API Gateway trigger to your Lambda
    ```yaml
    functions:
        hello:
            handler: handlers.hello
            events:
            - http:
                path: hello
                method: post
                cors: true
    ```
    * The `sls` output will now contain a URL for your lambda
    * [ ] Test that url in Insomnia
    ![insomnia-hello](./sns-api/assets/insomnia-hello.png)
* [ ] Add SNS logic for creating a topic
    * [ ] Install the `aws-sdk` package
        * This is required for local runtime, but it's already imported within a live Lambda
        * This is why we make sure to exclude the `node_modules` in the serverless.yml file
        ```yml
        package:
            patterns:
                - '!node_modules/**'
                - '!assets/**'
        ```
    * [ ] Add permissions so that Lambda can access all of the SNS api
        ```yml
        provider:
            ...
            iam: 
                role: 
                statements:
                    - Effect: "Allow"
                    Resource: "*"
                    Action:
                        - "sns:*"
        ```
    * [ ] Write the create-topic api using the [AWS Javascript docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#createTopic-property)
        * Function returns the following response format
        ```json
        {
            "message": "Succesfully create topic with the following name, {name}",
            "topicArn": "..."
        }
        ```
    * [ ] `IMPORTANT`: lock down your functions with an api key
        * Important for us to do this because our Lambdas are generative powers here whereby they create the tokens. They also have broad SNS permission so it's important to limit access to only secure assets.
        * On the functions add the following
            ```yml
            sns-create-topic:
                ...
                events:
                - http:
                    path: sns/topic
                    method: post
                    # Must add this private field
                    private: true
            ```
        * On the provider create an apiKey
            ```yml
            provider:
                ...
                apiKeys:
                    - snsKey
            ```
            * On the sls output `aws-cli` will generate a new token for you
            * In Insomnia you will need to add that token to the header `x-api-key`  
* [ ] Add SNS logic for subscribing endpoints to a topic
    * endpoints are email and phone number (amongst others), essentially addresses for the subscribers
    * to add subscribers we require the topicArn - which is the address of the topic
    * it's important here that we already have the topicArn, this is why the previous method returns the topicArn, it may be useful to store the arn in the db for a trip
    * [docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#subscribe-property)
    * Make sure that the function is also private
    * To make a request, we use the following JSON, and we must also use the apiToken
        ```json
        {
            "topicArn": "...",
            "endpoints": [
                {"type": "sms", "value":"+447......."}, 
                {"type": "email", "value": "....@gmail.com"}
            ]
        }
        ```
* [ ] Add SNS logic for publishing messages to a topic
    * [docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property)
    * takes a message, an topicArn, and an (optional) subject
    * publishes the message to the topicArn
    * To make a request we use the following JSON, and we must also use the apiToken
        ```json
        {
            "topicArn": "...",
            "message": "Test message",
            "subject": "Test subject",
            "senderId": "..."
        }
        ```
* To get the urls required for Insomnia look at the serverless framework logs 

