const auth0Config = {
  domain: 'dev-l4og12lsekqwkqbp.us.auth0.com',
  clientId: 'RNrftxwQV1VM9XT6igFru5ZKCUhVLzee',
  authorizationParams: {
    redirect_uri: `${window.location.origin}/login/callback`,
    audience: 'https://dev-l4og12lsekqwkqbp.us.auth0.com/api/v2/',
    scope: 'openid profile email offline_access'
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true
};

export default auth0Config; 