class ContestManager{
  constructor(database, modelName){
    this.database = database;
    this.modelName = modelName;
  }

  async createContest(id, name, manager, begin_at, duration){
    try {
      const contest = {
        id: id,
        name: name,
        manager: manager,
        problems: [],
        begin_at: begin_at,
        duration: duration,
        participants: []
      }

      await this.database.insertData(this.modelName, contest).then((value) => {
        console.log('Contest created : ' + id);
      });

      return contest;
    } catch (error) {
      console.error('Failed to create contest : ' + id);
      console.error(error);
    }
  }

  async findContest(key){
    try {
      const contest = await this.database.findData(key);
      if (!contest) {
        console.log('Contest not found : ' + key);
        return {};
      }

      return contest;
    } catch (error) {
      console.error('Failed to find contest : ' + key);
      console.error(error);
      return undefined;
    }
  }

  async deleteContest(key){
    try {
      const contest = await this.database.findData(key);
      if (!contest) {
        throw new Error('Contest not found : ' + key);
      }

      await this.database.deleteData(key).then((value) => {
        console.log('Contest deleted : ' + key);
      });
    } catch (error) {
      console.error('Failed to delete contest : ' + key);
      console.error(error);
    }
  }

  async updateProblems(key, problems){
    try {
      const contest = await this.database.getData(key);
      if (!contest) {
        throw new Error('Contest not found : ' + key);
      }

      contest.problems = problems;
      await this.database.updateData(key, contest).then((value) => {
        console.log('Problems updated : ' + key);
      });
    } catch (error) {
      console.error('Failed to add problems to contest : ' + key);
      console.error(error);
    }
  }

  async updateParticipants(key, participants){
    try {
      const contest = await this.database.getData(key);
      if (!contest) {
        throw new Error('Contest not found : ' + key);
      }

      contest.participants = participants;
      await this.database.updateData(key, contest).then((value) => {
        console.log('Participants updated : ' + key);
      });
    } catch (error) {
      console.error('Failed to add participants to contest : ' + key);
      console.error(error);
    }
  }
}

module.exports = ContestManager;