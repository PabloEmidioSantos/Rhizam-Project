import test from "node:test";
import assert from "node:assert/strict";
import { createManagedDataService } from "../src/services/managedDataService.js";

test("requests an exact count and only the selected page of managed records", async () => {
  const calls = [];
  const result = { data: [{ id: "record-51" }], count: 57, error: null };
  const service = createManagedDataService(() => ({
    from(table) {
      calls.push(["from", table]);
      return {
        select(columns, options) {
          calls.push(["select", columns, options]);
          return this;
        },
        order(column, options) {
          calls.push(["order", column, options]);
          return this;
        },
        range(from, to) {
          calls.push(["range", from, to]);
          return Promise.resolve(result);
        },
      };
    },
  }));

  assert.deepEqual(await service.listManagedRecords("requests", { page: 2, pageSize: 25 }), {
    records: [{ id: "record-51" }],
    count: 57,
  });
  assert.deepEqual(calls.at(-1), ["range", 50, 74]);
  assert.deepEqual(calls[1][2], { count: "exact" });
});

test("rejects invalid pagination and reports failed queries", async () => {
  let clientRequested = false;
  const service = createManagedDataService(() => {
    clientRequested = true;
    return {
      from() {
        return {
          select() { return this; },
          order() { return this; },
          range() { return Promise.resolve({ data: null, count: null, error: { message: "query failed" } }); },
        };
      },
    };
  });

  await assert.rejects(service.listManagedRecords("clients", { page: -1 }), /paginação/);
  assert.equal(clientRequested, false);
  await assert.rejects(service.listManagedRecords("clients"), { message: "Não foi possível carregar os registros." });
});
