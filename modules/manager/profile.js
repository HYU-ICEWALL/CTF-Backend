class ProfileManager {
  constructor(database, modelName) {
    this.database = database;
    this.modelName = modelName;
  }

  async createProfile(id, email, name, organization, department) {
    try {
      const profile = {
        id: id,
        email: email,
        name: name,
        organization: organization,
        department: department,
      }

      await this.database.insertData(id, profile).then((value) => {
        console.log('Profile created : ' + id);
      });

      return profile;
    } catch (error) {
      console.error('Failed to create profile : ' + id);
      console.error(error);
    }
  }

  async findProfile(key){
    try {
      const profile = await this.database.findData(this.modelName, key);
      if (!profile) {
        throw new Error('Profile not found : ' + key);
      }

      return profile;
    } catch (error) {
      console.error('Failed to find profile : ' + key);
      console.error(error);
      return undefined;
    }
  }

  async deleteProfile(key){
    try {
      const profile = await this.database.findData(this.modelName, key);
      if (!profile) {
        throw new Error('Profile not found : ' + key);
      }

      await this.database.deleteData(this.modelName, key).then((value) => {
        console.log('Profile deleted : ' + key);
      });
    } catch (error) {
      console.error('Failed to delete profile : ' + key);
      console.error(error);
    }
  }
}

module.exports = ProfileManager;