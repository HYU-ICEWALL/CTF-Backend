class ProfileManager {
  constructor(database) {
    this.database = database;
  }

  createProfile(id, email, name, organization, department) {
    try {
      const profile = {
        id: id,
        email: email,
        name: name,
        organization: organization,
        department: department,
      }

      this.database.insertData(id, profile);
      console.log('Profile created : ' + id);

      return profile;
    } catch (error) {
      console.error('Failed to create profile : ' + id);
      console.error(error);
    }
  }

  findProfile = (key) => {
    try {
      const profile = this.database.getData(key);
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

  deleteProfile = (key) => {
    try {
      const profile = this.database.getData(key);
      if (!profile) {
        throw new Error('Profile not found : ' + key);
      }

      this.database.deleteData(key);
    } catch (error) {
      console.error('Failed to delete profile : ' + key);
      console.error(error);
    }
  }
}

module.exports = ProfileManager;