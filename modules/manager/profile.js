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

      await this.database.insertData(this.modelName, profile).then((value) => {
        console.log('Profile created : ' + id);
      });

      return profile;
    } catch (error) {
      console.error('Failed to create profile : ' + id);
      console.error(error);

      return null;
    }
  }

  async findProfile(key){
    try {
      const profile = await this.database.findData(this.modelName, key);
      if (!profile) {
        console.log('Profile not found : ' + key);
        return undefined;
      }

      return profile;
    } catch (error) {
      console.error('Failed to find profile : ' + key);
      console.error(error);
      return null;
    }
  }

  async deleteProfile(id){
    try {
      const profile = await this.database.findData(this.modelName, {id: id});
      if (!profile) {
        throw new Error('Profile not found : ' + id);
      }

      await this.database.deleteData(this.modelName, {id: id}).then((value) => {
        console.log('Profile deleted : ' + id);
      });

      return true;
    } catch (error) {
      console.error('Failed to delete profile : ' + id);
      console.error(error);
      return null;
    }
  }

  async updateProfile(id, name, organization, department){
    try {
      const profiles = await this.database.findData(this.modelName, {id: id});
      if (profiles.length === 0) {
        throw new Error('Profile not found : ' + id);
      }

      const profile = profiles[0];

      const newProfile = {
        id: profile.id,
        email: profile.email,
        name: name,
        organization: organization,
        department: department,
      }

      await this.database.updateData(this.modelName, {id: newProfile.id}, newProfile).then((value) => {
        console.log('Profile updated : ' + id);
      });
      
      return newProfile;
    } catch (error) {
      console.error('Failed to update profile : ' + id);
      console.error(error);
      return null;
    }
  }
}

module.exports = ProfileManager;