const Handlebars = require('handlebars');

Handlebars.registerHelper ("setChecked", function (value, currentValue) {
  if ( value == currentValue ) {
    return 'checked';
  } else {
    return '';
  }
});