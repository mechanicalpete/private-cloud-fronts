import { Callback, Context, APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters } from 'aws-lambda';

export function produceAPIGatewayProxyEvent(queryString: APIGatewayProxyEventQueryStringParameters=null): APIGatewayProxyEvent {
    return {
        body: null,
        headers: {},
        multiValueHeaders: {  },
        httpMethod: 'GET',
        isBase64Encoded: false,
        path: 'string',
        pathParameters:  null,
        queryStringParameters: queryString,
        multiValueQueryStringParameters: null,
        stageVariables:  null,
        requestContext: null,
        resource: 'string',
    }
}

export function produceContext(): Context {
    return {
        callbackWaitsForEmptyEventLoop: true,
        functionName: 'string',
        functionVersion: 'string',
        invokedFunctionArn: 'string',
        memoryLimitInMB: 'string',
        awsRequestId: 'string',
        logGroupName: 'string',
        logStreamName: 'string',

        getRemainingTimeInMillis: () => { return -1 },
        done: () => { },
        fail: () => { },
        succeed: () => { }

    }
}

export function produceCallback(): Callback {
    return jest.fn();
}