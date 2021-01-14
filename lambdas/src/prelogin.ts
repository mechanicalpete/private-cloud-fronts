import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import 'source-map-support/register';
import { retrieveParameter } from './capabilities/capability-environment';
import { IDP_REDIRECTION_DOMAIN, IDP_REDIRECTION_URL } from './constants';

export async function handler(_event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {

  console.log(JSON.stringify(_event), JSON.stringify(_context));

  const idpRedirectionUrl = await retrieveParameter(IDP_REDIRECTION_URL);
  const domain = await retrieveParameter(IDP_REDIRECTION_DOMAIN);

  return {
    'statusCode': 200,
    'headers': {
      'Access-Control-Allow-Origin': `https://${domain}`,
      'Content-Type': 'text/html',
    },
    body: `<!DOCTYPE html>
<html>
<head>
  <title>@@NAME_CAMEL_CASE@@ - Sign-in Redirection</title>
  <meta http-equiv="refresh" content="0; URL=${idpRedirectionUrl}" />
  <meta http-equiv="cache-control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="pragma" content="no-cache" />
  <meta http-equiv="expires" content="0" />
</head>
<body>
</body>
</html>`
  };

};
