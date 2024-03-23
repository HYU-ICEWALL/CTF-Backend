const { createSalt, encryptPassword } = require("../encrypt")
const { v4 } = require('uuid');

class AccountManager{
  constructor(database){
    this.database = database;
  }
  
  createUuid = () => {
    const token = v4().split('-');
    return token[2] + token[1] + token[0] + token[3] + token[4];
  }

  createAccount = (email, id, password) => {
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

      this.database.insertData(id, account);
      console.log('Account created : ' + id);

      return account;
    } catch (error) {
      console.error('Failed to create account : ' + id);
      console.error(error);
    }
  }

  findAccountWithId = (id) => {
    try {
      const account = this.database.getData(id);
      if (!account) {
        throw new Error('Account not found : ' + id);
      }

      return account;
    } catch (error) {
      console.error('Failed to find account : ' + id);
      console.error(error);
      return undefined;
    }
  }

  findAccountExist = (id, password) => {
    try {
      const account = this.database.findData(id);
      if (!account) {
        return undefined;
      }

      if (account.password !== encryptPassword(password, account.salt)) {
        return undefined;
      }

      return account;
    } catch (error) {
      console.error('Find Account Error : ' + id);
      console.error(error);
      return undefined;
    }
  }

  deleteAccount = (id, password) => {
    try {
      const account = this.database.getData(id);
      if (!account) {
        throw new Error('Account not found : ' + id);
      }

      const encryptedPassword = encryptPassword(password, account.salt);
      if (account.password !== encryptedPassword) {
        throw new Error('Password not matched : ' + id);
      }

      this.database.deleteData(id);
    } catch (error) {
      console.error('Failed to delete account : ' + id);
      console.error(error);

      return undefined;
    }
  }
  changePassword = (id, password, newPassword) => {
    try {
      const account = this.database.getData(id);
      if (!account) {
        throw new Error('Account not found : ' + id);
      }

      const encryptedPassword = encryptPassword(password, account.salt);
      if (account.password !== encryptedPassword) {
        throw new Error('Password not matched : ' + id);
      }

      const newEncryptedPassword = encryptPassword(newPassword, account.salt);
      account.password = newEncryptedPassword;

      this.database.updateData(id, account);

      return account;
    } catch (error) {
      console.error('Failed to change password : ' + id);
      console.error(error);
      return undefined;
    }
  }
}

module.exports = AccountManager;