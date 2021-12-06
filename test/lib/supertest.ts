// import * as supertest from 'supertest';
const supertest = require('supertest');
export { supertest };

supertest.Test.prototype.validateSchema = function () {
  // await (expect(joi.validate(schema).error).to.be.null);
  console.log('TODO: Joi.validate');
  return this;
}

// supertest.Test.prototype.expectJsonLike = function (expected: object) {
export const expectJsonLike = (body: object, expected: any) => {
  expect(body).toMatchObject(expected);
  return this;
}

