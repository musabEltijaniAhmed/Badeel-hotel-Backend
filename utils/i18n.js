const path = require('path');
const i18n = require('i18n');

i18n.configure({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  directory: path.join(__dirname, '../locales'),
  queryParameter: 'lang',
  api: {
    __: 't', // now req.t
    __n: 'tn',
  },
});

module.exports = i18n; 