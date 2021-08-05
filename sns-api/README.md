# Serverless - Quick SNS api

> A speedy way to intract with SNS via Lambda using a Serverless scaffold

## Setup checklist

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
