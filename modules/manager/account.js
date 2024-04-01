require('dotenv').config();
const { createSalt, encryptPassword } = require("../encrypt")
const { v4 } = require('uuid');

class AccountManager{
  constructor(database, modelName){
    this.database = database;
    this.modelName = modelName;
  }
  
  createUuid = () => {
    const token = v4().split('-');
    return token[2] + token[1] + token[0] + token[3] + token[4];
  }

  compareAccount = (account1, account2) => {
    if(account1.id !== account2.id){
      return false;
    }
    if(account1.password !== account2.password){
      return false;
    }
    if(account1.salt !== account2.salt){
      return false;
    }
    if(account1.uuid !== account2.uuid){
      return false;
    }
    if(account1.email !== account2.email){
      return false;
    }
    return true;
  }

  async createAccount(email, id, password){
    try {
      const salt = createSalt();
      const encryptedPassword = encryptPassword(password, salt);
    
      const account = {
        id: id,
        password: encryptedPassword,
        salt: salt,
        uuid: this.createUuid(),
        email: email,
        verified: false,
      }
    
      await this.database.insertData(this.modelName, account).then((value) => {
        console.log("Account created : " + id);
      });
    
      return account;
    } catch (err) {
      console.error('Failed to create account : ' + id);
      console.error(err);
      return null;
    }
  }

  async findAccountWithId(id){
    try {
      const accounts = await this.database.findData(this.modelName, {id: id});
      if (accounts.length === 0) {
        console.log('Account not found : ' + id);
        return undefined;
      }

      if (accounts.length > 1) {
        console.log('Account is duplicated : ' + id);
        return undefined;
      }

      const account = accounts[0];
      console.log('Account found : ' + id);
      return account;
    } catch (error) {
      console.error('Failed to find account : ' + id);
      console.error(error);
      return null;
    }
  }

  async findAccount(id, password){
    try {
      const accounts = await this.database.findData(this.modelName, {id: id});
      if (accounts.length === 0) {
        console.log('Account not found : ' + id);
        return undefined;
      }

      if(accounts.length > 1){
        console.log('Account is duplicated : ' + id);
        return undefined;
      }

      const account = accounts[0];

      if (account.password !== encryptPassword(password, account.salt)) {
        console.log('Password not matched : ' + id);
        return undefined;
      }

      return account;
    } catch (error) {
      console.error('Find Account Error : ' + id);
      console.error(error);
      return null;
    }
  }

  async deleteAccount(id, password){
    try {
      const accounts = await this.database.findData(this.modelName, {id: id});
      if (accounts.length === 0) {
        console.log('Account not found : ' + id);
        return undefined;
      }

      if (accounts.length > 1) {
        console.log('Account is duplicated : ' + id);
        return undefined;
      }

      const account = accounts[0];
      const encryptedPassword = encryptPassword(password, account.salt);

      await this.database.deleteData(this.modelName, {id: id, password: encryptedPassword}).then((value) => {
        console.log('Account deleted : ' + id);
      });

      return true;
    } catch (error) {
      console.error('Failed to delete account : ' + id);
      console.error(error);

      return false;
    }
  }

  async changePassword(id, password, newPassword){
    try {
      const accounts = this.database.findData(this.modelName, {id: id});
      if (accounts.length === 0) {
        console.log('Account not found : ' + id);
        return undefined;
      }

      if (accounts.length > 1) {
        console.log('Account is duplicated : ' + id);
        return undefined;
      }

      const account = accounts[0];

      const encryptedPassword = encryptPassword(password, account.salt);
      if (account.password !== encryptedPassword) {
        throw new Error('Password not matched : ' + id);
      }

      const newEncryptedPassword = encryptPassword(newPassword, account.salt);
      account.password = newEncryptedPassword;
      await this.database.updateData(this.modelName, {id: id}, account).then((value) => {
        console.log('Password changed : ' + id);
      });

      return account;
    } catch (error) {
      console.error('Failed to change password : ' + id);
      console.error(error);
      return null;
    }
  }
}

module.exports = AccountManager;