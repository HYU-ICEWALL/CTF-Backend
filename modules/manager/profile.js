const { APIError, APIResponse } = require('../response');

class ProfileManager {
  constructor(database, modelName) {
    this.database = database;
    this.modelName = modelName;
  }

  async createProfile({id: id, email: email, name: name, organization: organization, department: department}) {
    try {
      const profile = {
        id: id,
        email: email,
        name: name,
        organization: organization,
        department: department,
      }

      const result = await this.database.insertData(this.modelName, profile);
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(400, 'Failed to create profile : ' + id);
    }
  }

  async findProfiles(key){
    try {
      const result = await this.database.findData(this.modelName, key);

      return result;
    } catch (error) {
      console.error(error);
      return new APIError(410, 'Failed to find profile : ', key);
    }
  }

  async deleteProfiles(key){
    try {
      const result = await this.database.deleteData(this.modelName, key);
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(420, 'Failed to delete profile : ' + key);
    }
  }

  async updateProfile({id: id, name: name, organization: organization, department: department}){
    try {
      const change = {}
      if(name) change.name = name;
      if(organization) change.organization = organization;
      if(department) change.department = department;

      const result = await this.database.updateData(this.modelName, {id: id}, change);
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(430, 'Failed to update profile : ' + id);
    }
  }

  async addSolved({id: id, solved: solved}){
    try {
      const result = await this.database.updateData(this.modelName, {id: id}, { $push: { solved: solved } });
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(440, 'Failed to add solved : ' + id);
    }
  }
}

module.exports = ProfileManager;