const fs = require('fs');
module.exports = class Contacts {
  constructor(clientId, config) {
    this.clientId = clientId;
    this.config = config;
    this.logDir = this.config.logDir ? `${process.cwd()}/${this.config.logDir}` : `${process.cwd()}/.whatsbot/logs`;
    if (!fs.existsSync(`${this.logDir}/${this.clientId}-contacts.json`)) {
      this.contacts = [];
      fs.writeFileSync(`${this.logDir}/${this.clientId}-contacts.json`, '[]');
    } else {
      this.contacts = require(`${this.logDir}/${this.clientId}-contacts.json`);
    }
  }
  
  addContact(contact) {
    this.contacts.push(contact);
  }
  
  getContacts() {
    return this.contacts;
  }
  
  saveContacts() {
    fs.writeFileSync(`${this.logDir}/${this.clientId}-contacts.json`, JSON.stringify(this.contacts, null, 2));
  }

  push(contact) {
    const id = this.contacts.length;
    const object = {
      id: id,
      ...contact,
    }
    this.contacts.push(object);
    this.saveContacts();
  }

  update(id, data) {
    const index = this.contacts.findIndex(c => c.id === id);
    for (const key in data) {
      this.contacts[index][key] = data[key];
    }
    this.saveContacts();
  }

  find(func) {
    return this.contacts.find(func);
  }
}