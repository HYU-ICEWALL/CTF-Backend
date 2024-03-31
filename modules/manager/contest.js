class ContestManager{
  constructor(database, modelName){
    this.database = database;
    this.modelName = modelName;
  }

  async createContest(id, name, manager, problems, begin_at, duration, participants){
    try {
      const contest = {
        id: id,
        name: name,
        manager: manager,
        problems: problems,
        begin_at: begin_at,
        duration: duration,
        participants: participants
      }

      await this.database.insertData(this.modelName, contest).then((value) => {
        console.log('Contest created : ' + id);
      });

      return contest;
    } catch (error) {
      console.error('Failed to create contest : ' + id);
      console.error(error);
      return null;
    }
  }

  async findContests(key){
    try {
      const contests = await this.database.findData(this.modelName, key);
      return contests;
    } catch (error) {
      console.error('Failed to find contest : ' + key);
      console.error(error);
      return null;
    }
  }

  async deleteContest(id){
    try {
      const contests = await this.database.findData(this.modelName, {id: id});
      if (contests.length === 0) {
        throw new Error('Contest not found : ' + id);
      }

      if(contests.length > 1){
        throw new Error('Contest is duplicated : ' + id);
      }

      await this.database.deleteData(this.modelName, {id: id}).then((value) => {
        console.log('Contest deleted : ' + id);
      });
      return true;
    } catch (error) {
      console.error('Failed to delete contest : ' + id);
      console.error(error);
      return false;
    }
  }

  async updateContest(id, name, manager, problems, begin_at, duration, participants){
    try {
      const contests = await this.database.findData(this.modelName, {id: id});
      if (contests.length === 0) {
        throw new Error('Contest not found : ' + id);
      }

      if(contests.length > 1){
        throw new Error('Contest is duplicated : ' + id);
      }

      const newContest = contests[0];
      newContest = {
        id: id,
        name: name,
        manager: manager,
        problems: problems,
        begin_at: begin_at,
        duration: duration,
        participants: participants
      }
      await this.database.updateData(this.modelName, {id: id}, newContest).then((value) => {
        console.log('Contest updated : ' + id);
      });

      return newContest;
    } catch (error) {
      console.error('Failed to add problems to contest : ' + id);
      console.error(error);

      return null;
    }
  }
}

module.exports = ContestManager;