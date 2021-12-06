// import * as supertest from 'supertest';
const supertest = require('supertest');
export { supertest };

// supertest.validateSchema =


supertest.Test.prototype.validateSchema = function () {
  // await (expect(joi.validate(schema).error).to.be.null);
  console.log('xxxxxxxxxxxxxxxxxxx');
  return this;
}
