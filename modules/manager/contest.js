class ContestManager{
  constructor(database){
    this.database = database;
  }

  createContest = (id, name, manager, begin_at, duration) => {
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

      this.database.insertData(id, contest);
      console.log('Contest created : ' + id);

      return contest;
    } catch (error) {
      console.error('Failed to create contest : ' + id);
      console.error(error);
    }
  }

  findContest = (key) => {
    try {
      const contest = this.database.getData(key);
      if (!contest) {
        throw new Error('Contest not found : ' + key);
      }

      return contest;
    } catch (error) {
      console.error('Failed to find contest : ' + key);
      console.error(error);
      return undefined;
    }
  }

  deleteContest = (key) => {
    try {
      const contest = this.database.getData(key);
      if (!contest) {
        throw new Error('Contest not found : ' + key);
      }

      this.database.deleteData(key);
    } catch (error) {
      console.error('Failed to delete contest : ' + key);
      console.error(error);
    }
  }

  updateProblems = (key, problems) => {
    try {
      const contest = this.database.getData(key);
      if (!contest) {
        throw new Error('Contest not found : ' + key);
      }

      contest.problems = problems;
      this.database.updateData(key, contest);
    } catch (error) {
      console.error('Failed to add problems to contest : ' + key);
      console.error(error);
    }
  }

  updateParticipants = (key, participants) => {
    try {
      const contest = this.database.getData(key);
      if (!contest) {
        throw new Error('Contest not found : ' + key);
      }

      contest.participants = participants;
      this.database.updateData(key, contest);
    } catch (error) {
      console.error('Failed to add participants to contest : ' + key);
      console.error(error);
    }
  }
}

module.exports = ContestManager;