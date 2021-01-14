import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: '@@NAME_KEBAB_CASE@@',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    profile: '@@AWS_PROFILE@@',
    region: '@@AWS_REGION@@',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    tracing: {
      apiGateway: true,
      lambda: true,
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
          'ssm:GetParameter'
        ],
        // Resource: 'arn:aws:ssm:${AWS::Region}:${AWS::AccountId}:parameter/@@NAME_KEBAB_CASE@@*'
        Resource: { 'Fn::Join': [':', ['arn:aws:ssm', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, 'parameter/@@NAME_KEBAB_CASE@@/*']] }
      },
      {
        Effect: 'Allow',
        Action: [
          'secretsmanager:GetSecretValue'
        ],
        // Resource: ' arn:aws:secretsmanager:${AWS::Region}:${AWS::AccountId}:secret:/@@NAME_KEBAB_CASE@@/cloudfront/private-key*'
        Resource: { 'Fn::Join': [':', ['arn:aws:secretsmanager', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, 'secret:/@@NAME_KEBAB_CASE@@/cloudfront/private-key*']] }
      }
    ]
  },
  package: {
    individually: true
  },
  functions: {
    prelogin: {
      handler: 'src/prelogin.handler',
      environment: {
        'IDP_REDIRECTION_DOMAIN': '/@@NAME_KEBAB_CASE@@/cognito/redirect-domain',
        'IDP_REDIRECTION_URL': '/@@NAME_KEBAB_CASE@@/cognito/post-login-url'
      },
      events: [
        {
          http: {
            method: 'get',
            path: 'prelogin',
          }
        }
      ]
    },
    pendinglogin: {
      handler: 'src/pendinglogin.handler',
      environment: {
        'IDP_REDIRECTION_DOMAIN': '/@@NAME_KEBAB_CASE@@/cognito/redirect-domain',
      },
      events: [
        {
          http: {
            method: 'get',
            path: 'pendinglogin',
          }
        }
      ]
    },
    postlogin: {
      handler: 'src/postlogin.handler',
      environment: {
        'IDP_REDIRECTION_DOMAIN': '/@@NAME_KEBAB_CASE@@/cognito/redirect-domain',
        'IDP_USER_POOL_REGION': '/@@NAME_KEBAB_CASE@@/cognito/user-pool-region',
        'IDP_USER_POOL_DOMAIN': '/@@NAME_KEBAB_CASE@@/cognito/user-pool-domain',
        'IDP_USER_POOL_CLIENT': '/@@NAME_KEBAB_CASE@@/cognito/user-pool-client',
        'IDP_USER_POOL_ID': '/@@NAME_KEBAB_CASE@@/cognito/user-pool-id',
        'CLOUDFRONT_KEY_PAIR_ID': '/@@NAME_KEBAB_CASE@@/cloudfront/key-pair-id',
        'CLOUDFRONT_PRIVATE_KEY': '/@@NAME_KEBAB_CASE@@/cloudfront/private-key'
      },
      events: [
        {
          http: {
            method: 'get',
            path: 'postlogin',
          }
        }
      ]
    }
  },
  resources: {
    Resources: {
      EnvironmentApiGatewayDomain: {
        Type: "AWS::SSM::Parameter",
        Properties: {
          Name: "/@@NAME_KEBAB_CASE@@/api-gateway/domain",
          Tier: "Standard",
          Type: "String",
          Value: {
            "Fn::Sub": "${ApiGatewayRestApi}.execute-api.${AWS::Region}.${AWS::URLSuffix}"
          }
        }
      }
    }
  }
}

module.exports = serverlessConfiguration;
