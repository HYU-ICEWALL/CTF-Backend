const { APIError, APIResponse } = require('../response');

class ProfileManager {
  constructor(database, modelName) {
    this.database = database;
    this.modelName = modelName;
  }

  async createProfile({id: id, email: email, name: name, organization: organization, department: department}, test=false) {
    try {
      const profile = {
        id: id,
        email: email,
        name: name,
        organization: organization,
        department: department,
        solved: [],
        test: test,
      }

      const result = await this.database.insertData(this.modelName, profile);
      if (result instanceof APIError) {
        return result;
      }

      return new APIResponse(0, {});
    } catch (error) {
      console.error(error);
      return new APIError(2300, 'Failed to create profile : ' + id);
    }
  }

  async findProfiles(key){
    try {
      const result = await this.database.findData(this.modelName, key);

      return result;
    } catch (error) {
      console.error(error);
      return new APIError(2310, 'Failed to find profile : ', key);
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
      return new APIError(2320, 'Failed to delete profile : ' + key);
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
      return new APIError(2330, 'Failed to update profile : ' + id);
    }
  }

  async addSolved({id: id, solved: solved}){
    try {
      const profileResult = await this.findProfiles({id: id});
      if(profileResult instanceof APIError){
        return profileResult;
      }

      const profile = profileResult.data[0];
      if(profile.solved.includes(solved)){
        return new APIResponse(0, {});
      }

      profile.solved.push(solved);
      const result = await this.database.updateData(this.modelName, {id: id}, {solved: profile.solved});
      return result;
    } catch (error) {
      console.error(error);
      return new APIError(2340, 'Failed to update solved in profile : ' + id);
    }
  }
}

module.exports = ProfileManager;