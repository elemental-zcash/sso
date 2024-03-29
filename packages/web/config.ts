// const PROCESS_ENV = {
//   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
//   NEXT_PUBLIC_API_URL_STAGING: process.env.NEXT_PUBLIC_API_URL_STAGING,
//   NEXT_PUBLIC_API_URL_PRODUCTION: process.env.NEXT_PUBLIC_API_URL_PRODUCTION,
// };

// const getEnvVarForAppEnv = (prefix, appEnv) => {
//   const envVar = PROCESS_ENV[`${prefix}_${appEnv.toLowerCase()}`] || PROCESS_ENV[prefix];

//   if (!envVar) {
//     throw new Error('No app environment found.');
//   }
//   return envVar;
// }

// const getApiUrl = (appEnvironment) =>
//   getEnvVarForAppEnv('NEXT_PUBLIC_API_URL', appEnvironment);

export const config = {
  GRAPHQL_API_URL: process.env.GRAPHQL_API_URL,
  // OAUTH_URL: `${getApiUrl(process.env.NEXT_PUBLIC_APP_ENV)}/oauth`,
  OAUTH_URL: process.env.OAUTH_URL,
};

// export const config = {
//   -  GRAPHQL_API_URL: `${getApiUrl(process.env.NEXT_PUBLIC_APP_ENV)}/graphql`,
//   -  OAUTH_URL: `${getApiUrl(process.env.NEXT_PUBLIC_APP_ENV)}/oauth`,
//   +  //GRAPHQL_API_URL: `${getApiUrl(process.env.NEXT_PUBLIC_APP_ENV)}/graphql`,
//   +  GRAPHQL_API_URL: 'https://sso-api.elementalzcash.com/graphql',
//   +  //OAUTH_URL: `${getApiUrl(process.env.NEXT_PUBLIC_APP_ENV)}/oauth`,
//   +  OAUTH_URL: 'https://sso-api.elementalzcash.com/oauth',
//    };
  
