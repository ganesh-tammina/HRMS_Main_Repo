const local =
  window.location.hostname.startsWith('30.') ||
  window.location.hostname === 'localhost';

export const environment = {
  production: false,
  apiURL: local ? '30.0.0.128:4201' : 'tamminademoapps.com:9295',
  candidateURL: local ? '30.0.0.78:4200' : 'tamminademoapps.com:9292',
};
