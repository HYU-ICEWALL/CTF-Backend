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
      return undefined;
    }
  }

  async findAccountWithId(id){
    try {
      const account = await this.database.findData(this.modelName, id);
      if (!account) {
        console.log('Account not found : ' + id);
        return {};
      }

      return account;
    } catch (error) {
      console.error('Failed to find account : ' + id);
      console.error(error);
      return undefined;
    }
  }

  async findAccountExist(id, password){
    try {
      const account = await this.database.findData(this.modelName, id);
      if (!account) {
        console.log('Account not found : ' + id);
        return {};
      }

      if (account.password !== encryptPassword(password, account.salt)) {
        console.log('Password not matched : ' + id);
        return {};
      }

      return account;
    } catch (error) {
      console.error('Find Account Error : ' + id);
      console.error(error);
      return undefined;
    }
  }

  async deleteAccount(id, password){
    try {
      const account = await this.database.findData(this.modelName, id);
      if (!account) {
        throw new Error('Account not found : ' + id);
      }

      const encryptedPassword = encryptPassword(password, account.salt);
      if (account.password !== encryptedPassword) {
        throw new Error('Password not matched : ' + id);
      }

      await this.database.deleteData(this.modelName, id).then((value) => {
        console.log('Account deleted : ' + id);
      });
    } catch (error) {
      console.error('Failed to delete account : ' + id);
      console.error(error);

      return undefined;
    }
  }

  async changePassword(id, password, newPassword){
    try {
      const account = this.database.getData(this.modelName, id);
      if (!account) {
        throw new Error('Account not found : ' + id);
      }

      const encryptedPassword = encryptPassword(password, account.salt);
      if (account.password !== encryptedPassword) {
        throw new Error('Password not matched : ' + id);
      }

      const newEncryptedPassword = encryptPassword(newPassword, account.salt);
      account.password = newEncryptedPassword;
      await this.database.updateData(this.modelName, id, account).then((value) => {
        console.log('Password changed : ' + id);
      });

      return account;
    } catch (error) {
      console.error('Failed to change password : ' + id);
      console.error(error);
      return undefined;
    }
  }
}

module.exports = AccountManager;