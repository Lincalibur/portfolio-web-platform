import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: 'PortfolioWebPlatform',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44337/',
    redirectUri: baseUrl,
    clientId: 'PortfolioWebPlatform_App',
    responseType: 'code',
    scope: 'offline_access PortfolioWebPlatform',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://localhost:44337',
      rootNamespace: 'PortfolioWebPlatform',
    },
  },
} as Environment;
