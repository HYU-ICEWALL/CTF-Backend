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

  async findProfile(key){
    try {
      const result = await this.database.findData(this.modelName, key);
      const profiles = result.data;
      if (profiles.length === 0) {
        return new APIError(411, 'Profile not found : ' + key);
      }
      else if (profiles.length > 1) {
        return new APIError(412, 'Profile is duplicated : ' + key);
      }

      return new APIResponse(0, profiles[0]);
    } catch (error) {
      console.error(error);
      return new APIError(410, 'Failed to find profile : ', key);
    }
  }

  async deleteProfile({id: id}){
    try {
      const result = await this.database.deleteData(this.modelName, {id: id});
      if(result instanceof APIError){
        return result;
      }
      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(420, 'Failed to delete profile : ' + id);
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