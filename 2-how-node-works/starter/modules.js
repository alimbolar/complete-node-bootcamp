// console.log(arguments);
// console.log(require('module').wrapper);

const C = require('./test-module-1')

const calc1 = new C();
console.log(calc1.add(2,5));
console.log(calc1.divide(2,5));
console.log(calc1.multiply(2,5));

const {add,multiply,divide} = require('./test-module-2');
const testModule3 = require('./test-module-3');

console.log(add(5,3));

require('./test-module-3')();
testModule3();
require('./test-module-3')();
testModule3();
require('./test-module-3')();
testModule3();
