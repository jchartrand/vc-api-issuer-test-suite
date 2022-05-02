/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */

const chai = require('chai');
const {filterByTag} = require('vc-api-test-suite-implementations');
const {shouldThrowInvalidInput, testIssuedVc} = require('./assertions');
const {createValidVc} = require('./mock.data');

const should = chai.should();
const {match, nonMatch} = filterByTag({issuerTags: ['VC-API']});

describe('Issue Credential - Data Integrity', function() {
  const summaries = new Set();
  this.summary = summaries;
  // column names for the matrix go here
  const columnNames = [];
  const reportData = [];
  // this will tell the report
  // to make an interop matrix with this suite
  this.matrix = true;
  this.report = true;
  this.columns = columnNames;
  this.notImplemented = [...nonMatch.keys()];
  this.rowLabel = 'Test Name';
  this.columnLabel = 'Issuer';
  // the reportData will be displayed under the test title
  this.reportData = reportData;
  for(const [name, implementation] of match) {
    columnNames.push(name);
    const issuer = implementation.issuers.find(
      issuer => issuer.tags.has('VC-API'));
    describe(name, function() {
      it('MUST successfully issue a credential.', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        const {issuer: {id: issuerId}} = issuer;
        const body = {
          credential: {
            ...credential,
            issuer: issuerId
          }
        };
        const {result, error} = await issuer.issue({body});
        should.exist(result, 'Expected result from issuer.');
        let issuedVc;
        if(result.data.verifiableCredential) {
          issuedVc = result.data.verifiableCredential;
        } else {
          issuedVc = result.data;
        }
        should.exist(issuedVc, 'Expected result to have data.');
        should.not.exist(error, 'Expected issuer to not Error.');
        result.status.should.equal(201, 'Expected statusCode 201.');
        testIssuedVc({issuedVc});
      });
      it('Request body MUST have property "credential".', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        const body = {verifiableCredential: credential};
        const {result, error} = await issuer.issue({body});
        shouldThrowInvalidInput({result, error});
      });
      it('credential MUST have property "@context".', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        delete credential['@context'];
        const body = {credential};
        const {result, error} = await issuer.issue({body});
        shouldThrowInvalidInput({result, error});
      });
      it('credential "@context" MUST be an array.', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        credential['@context'] = 4;
        const body = {credential};
        const {result, error} = await issuer.issue({body});
        shouldThrowInvalidInput({result, error});
      });
      it('credential "@context" items MUST be strings.', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        credential['@context'] = [{foo: true}, 4, false, null];
        const body = {credential};
        const {result, error} = await issuer.issue({body});
        shouldThrowInvalidInput({result, error});
      });
      it('"credential.type" MUST be an array.', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        credential.type = 4;
        const body = {credential};
        const {result, error} = await issuer.issue({body});
        shouldThrowInvalidInput({result, error});
      });
      it('credential MUST have property "type"', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        delete credential.type;
        const body = {credential};
        const {result, error} = await issuer.issue({body});
        shouldThrowInvalidInput({result, error});
      });
      it('"credential.type" items MUST be strings', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        credential.type = [2, null, {foo: true}, false];
        const body = {credential};
        const {result, error} = await issuer.issue({body});
        shouldThrowInvalidInput({result, error});
      });
      it('credential MUST have property "issuer"', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        delete credential.issuer;
        const body = {credential};
        const {result, error} = await issuer.issue({body});
        shouldThrowInvalidInput({result, error});
      });
      it('credential MUST have property "credentialSubject"', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        delete credential.credentialSubject;
        const body = {credential};
        const {result, error} = await issuer.issue({body});
        shouldThrowInvalidInput({result, error});
      });
      it('"credential.credentialSubject" MUST be an object', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        credential.credentialSubject = [null, true, 4];
        const body = {credential};
        const {result, error} = await issuer.issue({body});
        shouldThrowInvalidInput({result, error});
      });
      it('credential MAY have property "issuanceDate"', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        credential.issuanceDate = new Date().toISOString()
          .replace('.000Z', 'Z');
        const body = {credential};
        const {result, error} = await issuer.issue({body});
        should.exist(result, 'Expected result from issuer.');
        should.not.exist(error, 'Expected issuer to Error.');
        result.status.should.equal(201, 'Expected statusCode 201.');
      });
      it('credential MAY have property "expirationDate"', async function() {
        this.test.cell = {
          columnId: name,
          rowId: this.test.title
        };
        const credential = createValidVc();
        // expires in a year
        const oneYear = Date.now() + 365 * 24 * 60 * 60 * 1000;
        credential.expirationDate = new Date(oneYear).toISOString()
          .replace('.000Z', 'Z');
        const body = {credential};
        const {result, error} = await issuer.issue({body});
        should.exist(result, 'Expected result from issuer.');
        should.not.exist(error, 'Expected issuer to not Error.');
        result.status.should.equal(201, 'Expected statusCode 201.');
      });
    });
  }
});
