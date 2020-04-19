/*
This library provieds a simple JSON based noSQL database for NodeJS
Data is stored as follows:
{
  "table_name": {
    "next_id": 0,
    "schema": { "field_name1": {}, "field_name2": {}, ...},
    "records": {
      "0": { "key1": "key1_value", "field1": "value1",  "field2": "value2", ... },
      ...
      "9999": { "key2": "key_value", "field1": "value1",  "field2": "value2", ... },
    }
    "indexes": {
      "0_key_value1": "0",
      "1_key_value2": "99"
    }
  }
}
*/

const fs = require("fs");
const dbMethods = {
  Filename: "",
  Tablename: "",
  Schema: {},
  COL_MAX: 0,
  db_read: () => {
    if (fs.existsSync(this.Filename)) {
      return JSON.parse(fs.readFileSync(this.Filename, "utf8"));
    }
    return null;
  },
  db_write: newContent => {
    fs.writeFileSync(this.Filename, JSON.stringify(newContent));
  },
  record_clear_index: (dbContent, dataObj) => {
    const tbn = this.Tablename;
    const schema = dbContent[tbn].schema;
    for (var field in schema) {
      if (schema[field].type === "key" && field !== "id" && dataObj[field]) {
        const index = schema[field].col + "_" + dataObj[field];
        const hasKey = dbContent[tbn].indexes[index];
        if (hasKey) delete dbContent[tbn].indexes[index];
      }
    }
  },
  record_add_index: (dbContent, dataObj, recKey) => {
    const tbn = this.Tablename;
    const schema = dbContent[tbn].schema;
    for (var field in schema) {
      if (schema[field].type === "key" && field !== "id" && dataObj[field]) {
        dbContent[tbn].indexes[schema[field].col + "_" + dataObj[field]] = recKey;
      }
    }
  },
  record_indexes_exist: (dbContent, dataObj) => {
    const tbn = this.Tablename;
    const schema = dbContent[tbn].schema;
    for (var field in schema) {
      if (schema[field].type === "key" && field !== "id" && dataObj[field]) {
        const hasIndex = dbContent[tbn].indexes[schema[field].col + "_" + dataObj[field]];
        if (hasIndex && hasIndex !== dataObj.id) return hasIndex;
      }
    }
    return false;
  },
  record_hasall_indexes: (dbContent, dataObj) => {
    const tbn = this.Tablename;
    const schema = dbContent[tbn].schema;
    for (var field in schema) {
      if (schema[field].type === "key" && !dataObj[field]) return false;
    }
    return true;
  },
  init: (fileName, tableName, schema) => {
    this.Filename = fileName;
    this.Tablename = tableName;
    this.Schema = schema;
    this.COL_MAX = Object.keys(schema).length;
    let dbContent = {};
    if (fs.existsSync(fileName)) {
      dbContent = dbMethods.db_read();
    }
    if (!dbContent[this.Tablename]) {
      dbContent[this.Tablename] = {
        next_id: 1,
        schema,
        records: {},
        indexes: {}
      };
    }
    dbMethods.db_write(dbContent);
  },
  find: (whereObj, db_content) => {
    const tbn = this.Tablename;
    const dbContent = db_content ? db_content : dbMethods.db_read();

    const schema = dbContent[tbn].schema;
    for (var key in whereObj) {
      const ftype = schema[key].type;
      if (ftype === "key") {
        const hasIndex = dbContent[tbn].indexes[schema[key].col + "_" + whereObj[key]];
        if (hasIndex) {
          const foundObj = dbContent[tbn].records[hasIndex];
          foundObj.id = hasIndex;
          return foundObj;
        }
      }
      break;
    }

    return null;
  },
  update: (foundObj, valuesObj) => {
    const tbn = this.Tablename;
    const dbContent = dbMethods.db_read();
    const mergedObj = Object.assign({}, foundObj, valuesObj);
    const hasAllIndexes = dbMethods.record_hasall_indexes(dbContent, mergedObj);
    if (!hasAllIndexes) return "Record does not have all required indexes";
    // check if indexes already exist
    const hasIndex = dbMethods.record_indexes_exist(dbContent, mergedObj);
    if (hasIndex) return "Record with key already exists - id: " + hasIndex;
    // clear indexes
    const existingObj = dbContent[tbn].records[foundObj.id];
    dbMethods.record_clear_index(dbContent, existingObj);
    // add record
    mergedObj.id = undefined;
    dbContent[tbn].records[foundObj.id] = mergedObj;
    // add indexes
    dbMethods.record_add_index(dbContent, mergedObj, foundObj.id);
    dbMethods.db_write(dbContent);
    return mergedObj;
  },
  insert: dataObj => {
    const tbn = this.Tablename;
    const dbContent = dbMethods.db_read();
    dataObj.id = -1
    const hasAllIndexes = dbMethods.record_hasall_indexes(dbContent, dataObj);
    if (!hasAllIndexes) return "Record does not have all required indexes";
    // get nex_id and increment
    const { next_id } = dbContent[tbn];
    const newKey = next_id;
    dbContent[tbn].next_id = next_id + 1;
    // check if indexes already exist
    const hasIndex = dbMethods.record_indexes_exist(dbContent, dataObj);
    if (hasIndex) return "record with key already exists - id: " + hasIndex;
    // insert record
    dataObj.id = undefined;
    dbContent[tbn].records[newKey] = dataObj;
    // add indexes
    dbMethods.record_add_index(dbContent, dataObj, newKey);
    dbMethods.db_write(dbContent);
    dataObj.id = newKey;
    return dataObj;
  },
  remove: whereObj => {
    const tbn = this.Tablename;
    const dbContent = dbMethods.db_read();
    const sr = dbMethods.find(whereObj, dbContent);
    if (sr !== null && typeof sr === "object") {
      dbMethods.record_clear_index(dbContent, sr);
      delete dbContent[tbn].records[sr.id];
      dbMethods.db_write(dbContent);
      return sr;
    }
    return "Remove record error: " + sr;
  }
};

// Uncomment below to test the library
/*
const print = console.log;
const jprint = obj => console.log(JSON.stringify(obj, null, 2));

// types: key, string, number
// a field with id key will be auto incremented
const USER_SCHEMA = {
  id: { col: 1, type: "key" },
  uuid: { col: 2, type: "key" },
  email: { col: 3, type: "key" },
  status: { col: 4, type: "string" },
  role: { col: 5, type: "string" },
  password: { col: 6, type: "string" },
  salt: { col: 7, type: "string" },
  firstname: { col: 8, type: "string" },
  lastname: { col: 9, type: "string" },
  settings: { col: 10, type: "string" },
  note: { col: 11, type: "string" }
};

function testDB() {
  const Chance = require("chance");
  const chance = new Chance();
  const db = { users: Object.create(dbMethods) };
  db.users.init("test_db.json", "users", USER_SCHEMA);

  const AdminRecord = {
    uuid: chance.guid(),
    email: `super.admin@example.com`,
    status: "A",
    role: "SA",
    firstname: "Super",
    lastname: "Admin",
    password: chance.guid(),
    salt: chance.guid(),
    note: chance.paragraph()
  };

  // insert 10 records
  for (var i = 0; i < 10; i++) {
    const firstname = chance.first();
    const lastname = chance.last();
    // prettier-ignore
    const data = i === 1 ? AdminRecord : {
        uuid: chance.guid(),
        status: "A",
        role: "US",
        firstname,
        lastname,
        email: `${firstname}.${lastname}@example.com`.toLowerCase(),
        password: chance.guid(),
        salt: chance.guid(),
        note: chance.paragraph()
      };
    if (i === 2) data.email = "delete@example.com";

    const newRecord = db.users.insert(data);
    // if (typeof(newRecord) !== 'object') {
    //   print('Could not add new record!', newRecord, JSON.stringify(data, null, 2))
    //   break;
    // }
  }

  // change not for super admin
  const res = db.users.find({ email: "super.admin@example.com" });
  db.users.update(res, { note: "You are superman!" });

  // delete the record with email delete@example
  const removed = db.users.remove({ email: "delete@example.com" });

  const test1 = db.users.find({ email: "super.admin@example.com" });
  const test2 = db.users.find({ email: "delete@example.com" });

  const result = test1.id === 2 && test2 === null ? "PASS" : "FAILED";
  print(`Test result: ${result} - 1:${test1.id} 2:${test2}`);
}

testDB();
*/
