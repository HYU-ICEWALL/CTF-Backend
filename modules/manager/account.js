const { APIResponse, APIError } = require('../response');
const crypto = require('crypto');

class AccountManager{
  constructor(database, modelName){
    this.database = database;
    this.modelName = modelName;
  }

  createSalt = (saltSize) => {
    return crypto.randomBytes(parseInt(saltSize)).toString('base64');
  }

  encryptPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('base64');
  }


  async createAccount({email: email, id: id, password: password, authority: authority}, saltSize, test=false){
    try {
      const idRegex = /^[a-zA-Z0-9]{4,12}$/;
      if (!idRegex.test(id)) {
        return new APIError(2001, 'Invalid id : ' + id);
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return new APIError(2002, 'Invalid email : ' + email);
      }

      const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+]{8,20}$/;
      if (!passwordRegex.test(password)) {
        return new APIError(2003, 'Invalid password : ' + password);
      }
      
      const salt = this.createSalt(saltSize);
      const encryptedPassword = this.encryptPassword(password, salt);
    
      const account = {
        id: id,
        password: encryptedPassword,
        salt: salt,
        email: email,
        verified: false,
        authority: authority,
        test : test
      }
    
      const result = await this.database.insertData(this.modelName, account);
      if (result instanceof APIError) {
        return result;
      }
      return new APIResponse(0, {});
    } catch (err) {
      console.log(err);
      return new APIError(2000, 'Failed to create account : ' + id);
    }
  }

  // for admin
  async findAccounts(key){
    try {
      const result = await this.database.findData(this.modelName, key);
      return result;
    } catch (error) {
      console.error(error);
      return new APIError(2010, 'Failed to find accounts');
    }
  }

  async findAccountsById({id: id}){
    try {
      const result = await this.database.findData(this.modelName, {id: id});
      return result;
    } catch (error) {
      console.error(error);
      return new APIError(2020, 'Failed to find account : ' + id);
    }
  }

  async findAccountByPassword({id: id, password: password}){
    try {
      const result = await this.database.findData(this.modelName, {id: id});
      if(result instanceof APIError){
        return result;
      }

      const accounts = result.data;
      if(accounts.length != 1){
        return new APIError(2031, 'Account not found : ' + id);
      }

      const account = accounts[0];
      const encryptedPassword = this.encryptPassword(password, account.salt);
      if(account.password !== encryptedPassword){
        return new APIError(2032, 'Password incorrect : ' + id);
      }

      return new APIResponse(0, account);      
    } catch (error) {
      console.error(error);
      return new APIError(2030, 'Failed to find account : ' + id);
    }
  }

  async deleteAccounts(key){
    try {
      const result = await this.database.deleteData(this.modelName, key);
      if(result instanceof APIError){
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(2040, 'Failed to delete account : ' + id);
    }
  }

  async changePassword({id: id, password: password, newPassword: newPassword}){
    try {
      const accounts = this.database.findData(this.modelName, {id: id});
      if (accounts.length != 1) {
        return new APIError(2051, 'Account not found : ' + id);
      }

      const account = accounts[0];

      const encryptedPassword = this.encryptPassword(password, account.salt);
      if (account.password !== encryptedPassword) {
        return new APIError(2052, 'Password incorrect : ' + id);
      }

      const newEncryptedPassword = this.encryptPassword(newPassword, account.salt);
      account.password = newEncryptedPassword;
      const result = await this.database.updateData(this.modelName, {id: id}, account);
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(2050, 'Failed to change password : ' + id);
    }
  }
}

module.exports = AccountManager;