const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const DATA_DIR = path.join(__dirname, "../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const RECORDS_FILE = path.join(DATA_DIR, "taxrecords.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Function to read users
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return initializeDefaultUsers();
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch (e) {
    console.error("[FallbackDB] Error reading users file, returning empty array", e);
    return [];
  }
}

// Function to write users
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("[FallbackDB] Error writing users file", e);
  }
}

// Function to read tax records
function readRecords() {
  try {
    if (!fs.existsSync(RECORDS_FILE)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(RECORDS_FILE, "utf-8"));
  } catch (e) {
    console.error("[FallbackDB] Error reading records file, returning empty array", e);
    return [];
  }
}

// Function to write tax records
function writeRecords(records) {
  try {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2));
  } catch (e) {
    console.error("[FallbackDB] Error writing records file", e);
  }
}

// Initialize default users if users.json doesn't exist
function initializeDefaultUsers() {
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  const userPasswordHash = bcrypt.hashSync("user123", 10);
  
  const defaultUsers = [
    {
      _id: "fallback_usr_admin",
      name: "System Admin",
      email: "admin123@gmail.com",
      password: adminPasswordHash,
      role: "admin"
    },
    {
      _id: "fallback_usr_user",
      name: "Default User",
      email: "user123@gmail.com",
      password: userPasswordHash,
      role: "user"
    }
  ];
  writeUsers(defaultUsers);
  return defaultUsers;
}

// Ensure files are initialized on load
readUsers();
readRecords();

class UserDocument {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = "fallback_usr_" + Math.random().toString(36).substr(2, 9);
    }
    if (!this.role) {
      this.role = "user";
    }
  }

  async save() {
    const users = readUsers();
    const idx = users.findIndex(u => u._id === this._id || u.email === this.email);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...this };
    } else {
      users.push(this);
    }
    writeUsers(users);
    return this;
  }
}

class TaxRecordDocument {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = "fallback_rec_" + Math.random().toString(36).substr(2, 9);
    }
    if (!this.createdAt) {
      this.createdAt = new Date().toISOString();
    }
  }

  async save() {
    const records = readRecords();
    const idx = records.findIndex(r => r._id === this._id);
    if (idx >= 0) {
      records[idx] = { ...records[idx], ...this };
    } else {
      records.push(this);
    }
    writeRecords(records);
    return this;
  }

  async deleteOne() {
    let records = readRecords();
    records = records.filter(r => r._id !== this._id);
    writeRecords(records);
    return { deletedCount: 1 };
  }
}

const UserMock = {
  findOne: async (query) => {
    console.log("[FallbackDB] User.findOne", query);
    const users = readUsers();
    const user = users.find(u => {
      for (let k in query) {
        if (u[k] !== query[k]) return false;
      }
      return true;
    });
    return user ? new UserDocument(user) : null;
  },

  findById: async (id) => {
    console.log("[FallbackDB] User.findById", id);
    const users = readUsers();
    const user = users.find(u => u._id === id);
    return user ? new UserDocument(user) : null;
  },

  findByIdAndDelete: async (id) => {
    console.log("[FallbackDB] User.findByIdAndDelete", id);
    let users = readUsers();
    users = users.filter(u => u._id !== id);
    writeUsers(users);
    return { deletedCount: 1 };
  },

  updateOne: async (query, update) => {
    console.log("[FallbackDB] User.updateOne", query, update);
    const users = readUsers();
    const user = users.find(u => {
      for (let k in query) {
        if (u[k] !== query[k]) return false;
      }
      return true;
    });
    if (!user) return { matchedCount: 0, modifiedCount: 0 };
    
    if (update.$set) {
      Object.assign(user, update.$set);
    } else {
      Object.assign(user, update);
    }
    writeUsers(users);
    return { matchedCount: 1, modifiedCount: 1 };
  },

  countDocuments: async () => {
    console.log("[FallbackDB] User.countDocuments");
    return readUsers().length;
  },

  find: (query, projection) => {
    console.log("[FallbackDB] User.find", { query, projection });
    const users = readUsers();
    let results = users;
    if (query && Object.keys(query).length > 0) {
      results = users.filter(u => {
        for (let k in query) {
          if (u[k] !== query[k]) return false;
        }
        return true;
      });
    }

    const chain = {
      select: (fields) => {
        return results.map(u => {
          const doc = new UserDocument(u);
          if (typeof fields === "string") {
            if (fields.startsWith("-")) {
              const fieldToRemove = fields.substring(1);
              delete doc[fieldToRemove];
            } else {
              const keepFields = fields.split(" ");
              for (let key in doc) {
                if (key !== "_id" && !keepFields.includes(key)) {
                  delete doc[key];
                }
              }
            }
          }
          return doc;
        });
      },
      then: (resolve, reject) => {
        resolve(results.map(u => new UserDocument(u)));
      }
    };
    return chain;
  }
};

class FallbackUser {
  constructor(data) {
    return new UserDocument(data);
  }
}
Object.assign(FallbackUser, UserMock);

const TaxRecordMock = {
  create: async (data) => {
    console.log("[FallbackDB] TaxRecord.create", data);
    const doc = new TaxRecordDocument(data);
    await doc.save();
    return doc;
  },

  find: (query) => {
    console.log("[FallbackDB] TaxRecord.find", query);
    const records = readRecords();
    let results = records;
    if (query && Object.keys(query).length > 0) {
      results = records.filter(r => {
        for (let k in query) {
          if (r[k] !== query[k]) return false;
        }
        return true;
      });
    }

    const chain = {
      sort: (sortRule) => {
        if (sortRule && sortRule.createdAt === -1) {
          results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return chain;
      },
      then: (resolve, reject) => {
        resolve(results.map(r => new TaxRecordDocument(r)));
      }
    };
    return chain;
  },

  findById: async (id) => {
    console.log("[FallbackDB] TaxRecord.findById", id);
    const records = readRecords();
    const record = records.find(r => r._id === id);
    return record ? new TaxRecordDocument(record) : null;
  }
};

class FallbackTaxRecord {
  constructor(data) {
    return new TaxRecordDocument(data);
  }
}
Object.assign(FallbackTaxRecord, TaxRecordMock);

function createFallbackProxy(realModel, fallbackModel) {
  const ProxyClass = function(data) {
    if (mongoose.connection.readyState === 1) {
      return new realModel(data);
    } else {
      console.warn(`[FallbackDB] Using local fallback database.`);
      return new fallbackModel(data);
    }
  };

  return new Proxy(ProxyClass, {
    get(target, prop, receiver) {
      if (mongoose.connection.readyState === 1) {
        return Reflect.get(realModel, prop);
      } else {
        return Reflect.get(fallbackModel, prop);
      }
    },
    set(target, prop, value, receiver) {
      if (mongoose.connection.readyState === 1) {
        return Reflect.set(realModel, prop, value);
      } else {
        return Reflect.set(fallbackModel, prop, value);
      }
    }
  });
}

module.exports = {
  createFallbackProxy,
  FallbackUser,
  FallbackTaxRecord
};
