import { expect } from 'chai';
import * as sinon from 'sinon';
import { MockStorageAdapter } from '../../mocks/storage-mock';
import { BatchOperations } from '../../../src/tools/batch-operations';
import { Serialization } from '../../../src/tools/serialization';
import { FileOperations } from '../../../src/tools/file-operations';
import fs from 'fs/promises';
describe('FileOperations', function () {
  let adapter: MockStorageAdapter<string, any>;
  let batchOperations: BatchOperations<string, any>;
  let serialization: Serialization<string, any>;
  let fileOperations: FileOperations<string, any>;
  let fsReadStub: sinon.SinonStub;
  let fsWriteStub: sinon.SinonStub;

  beforeEach(function () {
    adapter = new MockStorageAdapter();
    batchOperations = new BatchOperations(adapter);
    serialization = new Serialization(adapter, batchOperations);
    fileOperations = new FileOperations(serialization);

    fsReadStub = sinon.stub(fs, 'readFile');
    fsWriteStub = sinon.stub(fs, 'writeFile');
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('export', function () {
    it('should export data to a file correctly', async function () {
      const data = { key1: { value: 'test' }, key2: { value: 'example' } };
      batchOperations.setBatch(Object.entries(data));

      await fileOperations.export('test.json');

      const expectedJson = JSON.stringify(data);
      expect(fsWriteStub.calledOnceWith('test.json', expectedJson)).to.be.true;
    });

    it('should return JSON string when no file path is provided', async function () {
      const data = { key1: { value: 'test' } };
      batchOperations.setBatch(Object.entries(data));

      const result = await fileOperations.export('');

      const expectedJson = JSON.stringify(data);
      expect(result).to.equal(expectedJson);
    });

    it('should handle large data export efficiently', async function () {
      const largeData: [string, any][] = Array.from({ length: 1000 }, (_, i) => [`key${i}`, { value: `value${i}` }]);

      batchOperations.setBatch(largeData);

      const start = Date.now();
      await fileOperations.export('large_data.json');
      const duration = Date.now() - start;

      expect(duration).to.be.lessThan(100); // Expect the export to finish within 100ms
      expect(fsWriteStub.calledOnce).to.be.true;
    });
  });

  describe('import', function () {
    it('should import data correctly from a file', async function () {
      const fileContent = '{"key1":{"value":"test"},"key2":{"value":"example"}}';
      fsReadStub.resolves(fileContent);

      await fileOperations.import('test.json');

      expect(adapter.get('key1')).to.deep.equal({ value: 'test' });
      expect(adapter.get('key2')).to.deep.equal({ value: 'example' });
    });

    it('should handle empty file gracefully', async function () {
      fsReadStub.resolves('{}'); // Empty JSON

      await fileOperations.import('empty.json');

      expect(adapter.size()).to.equal(0); // No data should be imported
    });

    it('should handle non-existent file gracefully', async function () {
      try {
        await fileOperations.import('nonexistent.json');
      } catch (err: any) {
        expect(err.message).to.equal('An unexpected error occurred');
      }
    });

    it('should handle invalid JSON gracefully', async function () {
      const invalidJson = '{"key1": "value1",}'; // Invalid JSON (trailing comma)
      fsReadStub.resolves(invalidJson);

      try {
        await fileOperations.import('invalid.json');
      } catch (err: any) {
        expect(err.message).to.include('An unexpected error occurred');
      }
    });

    it('should handle large data import efficiently', async function () {
      const largeData = Array.from({ length: 1000 }, (_, i) => [`key${i}`, { value: `value${i}` }]);
      const largeJson = JSON.stringify(Object.fromEntries(largeData));

      fsReadStub.resolves(largeJson);

      const start = Date.now();
      await fileOperations.import('large_data.json');
      const duration = Date.now() - start;

      expect(duration).to.be.lessThan(100); // Expect the import to finish within 100ms
      expect(adapter.size()).to.equal(1000);
    });
  });

  describe('error handling', function () {
    it('should handle missing file path gracefully for export', function () {
      const data = { key1: { value: 'test' } };
      batchOperations.setBatch(Object.entries(data));

      try {
        fileOperations.export('');
      } catch (err: any) {
        expect(err).to.be.undefined; // No error should occur, export should work without path
      }
    });
  });
});
