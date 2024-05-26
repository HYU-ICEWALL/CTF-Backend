const { createSalt, encryptPassword } = require("../encrypt")
const { APIResponse, APIError } = require('../response');

class AccountManager{
  constructor(database, modelName){
    this.database = database;
    this.modelName = modelName;
  }

  checkValidAccount = (id, password, email) => {
    // id must start with alphabet and contain only alphabet and number and length must be 6 ~ 20
    const result = {}
    if (!/^[a-zA-Z][a-zA-Z0-9]{5,19}$/.test(id)) {
      result.id = id;
    }

    // password must contain alphabet, number, special character and length must be 8 ~ 20
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,20}$/.test(password)) {
      result.password = password;
    }

    // email must be valid
    if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/.test(email)) {
      result.email = email;
    }

    return Object.keys(result).length === 0 ? true : result;
  }

  async createAccount({email: email, id: id, password: password, authority: authority}, saltSize){
    try {
      // const valid = this.checkValidAccount(id, password, email);
      // if(valid != true){
      //   return new APIError(101, 'Invalid account format : ' + JSON.stringify(valid));
      // }

      const salt = createSalt(saltSize);
      const encryptedPassword = encryptPassword(password, salt);
    
      const account = {
        id: id,
        password: encryptedPassword,
        salt: salt,
        email: email,
        verified: false,
        authority: authority
      }
    
      const result = await this.database.insertData(this.modelName, account);
      if (result instanceof APIError) {
        return result;
      }
      return new APIResponse(0, {});
    } catch (err) {
      console.log(err);
      return new APIError(100, 'Failed to create account : ' + id);
    }
  }

  // for admin
  async findAccounts(key){
    try {
      const result = await this.database.findData(this.modelName, key);
      return result;
    } catch (error) {
      console.error(error);
      return new APIError(111, 'Failed to find accounts');
    }
  }

  async findAccountsWithId({id: id}){
    try {
      const result = await this.database.findData(this.modelName, {id: id});
      return result;
    } catch (error) {
      console.error(error);
      return new APIError(110, 'Failed to find account : ' + id);
    }
  }

  async findAccountWithPassword({id: id, password: password}){
    try {
      const result = await this.database.findData(this.modelName, {id: id});
      if(result instanceof APIError){
        return result;
      }

      const accounts = result.data;
      if(accounts.length === 0){
        return new APIError(121, 'Account not found : ' + id);
      }
      else if(accounts.length > 1){
        return new APIError(122, 'Account is duplicated : ' + id);
      }

      const account = accounts[0];
      const encryptedPassword = encryptPassword(password, account.salt);
      if(account.password !== encryptedPassword){
        return new APIError(123, 'Password not matched : ' + id);
      }

      return new APIResponse(0, account);      
    } catch (error) {
      console.error(error);
      return new APIError(120, 'Failed to find account : ' + id);
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
      return new APIError(130, 'Failed to delete account : ' + id);
    }
  }

  async changePassword({id: id, password: password, newPassword: newPassword}){
    try {
      const accounts = this.database.findData(this.modelName, {id: id});
      if (accounts.length === 0) {
        return new APIError(141, 'Account not found : ' + id);
      }

      if (accounts.length > 1) {
        return new APIError(142, 'Account is duplicated : ' + id);
      }

      const account = accounts[0];

      const encryptedPassword = encryptPassword(password, account.salt);
      if (account.password !== encryptedPassword) {
        return new APIError(143, 'Password not matched : ' + id);
      }

      const newEncryptedPassword = encryptPassword(newPassword, account.salt);
      account.password = newEncryptedPassword;
      const result = await this.database.updateData(this.modelName, {id: id}, account);
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(140, 'Failed to change password : ' + id);
    }
  }

  checkAuthority = async (req) => {
    const accountResult = await this.findAccountsWithId({id: req.session.data.id});
    if (accountResult instanceof APIError) {
      res.status(200).json(accountResult);
      return;
    }
    const accounts = accountResult.data;
    if (accounts.length === 0) {
      return new APIError(141, 'Account not found : ' + id);
    }

    if (accounts.length > 1) {
      return new APIError(142, 'Account is duplicated : ' + id);
    }

    if (accounts[0].authority != 1) {
      res.status(200).json(new APIError(801, 'Permission denied'));
      return;
    }

    return new APIResponse(0, {});
  }
}

module.exports = AccountManager;