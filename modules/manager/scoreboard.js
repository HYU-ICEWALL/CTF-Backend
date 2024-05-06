class ScoreboardManager {
  constructor(database, modelName) {
    this.database = database;
    this.modelName = modelName;
  }

  async createScoreboard(id) {
    try {
      const scoreboard = {
        contest: id,
        solved: [],
      }

      await this.database.insertData(this.modelName, scoreboard).then((value) => {
        console.log('Scoreboard created : ' + id);
      });

      return scoreboard;
    } catch (error) {
      console.error('Failed to create scoreboard : ' + id);
      console.error(error);

      return null;
    }
  }

  async findScoreboard(key) {
    try {
      const scoreboard = await this.database.findData(this.modelName, key);
      if (!scoreboard) {
        console.log('Scoreboard not found : ' + key);
        return undefined;
      }

      return scoreboard;
    } catch (error) {
      console.error('Failed to find scoreboard : ' + key);
      console.error(error);
      return null;
    }
  }

  async deleteScoreboard(id) {
    try {
      const scoreboard = await this.database.findData(this.modelName, { contest: id });
      if (!scoreboard) {
        throw new Error('Scoreboard not found : ' + id);
      }

      await this.database.deleteData(this.modelName, { contest: id }).then((value) => {
        console.log('Scoreboard deleted : ' + id);
      });

      return true;
    } catch (error) {
      console.error('Failed to delete Scoreboard : ' + id);
      console.error(error);
      return null;
    }
  }

  async updateScoreboard(id, solved) {
    try {
      const scoreboards = await this.database.findData(this.modelName, { id: id });
      if (scoreboards.length === 0) {
        throw new Error('Scoreboard not found : ' + id);
      }

      if (scoreboards.length > 1) {
        throw new Error('Scoreboard is duplicated : ' + id);
      }

      const scoreboard = scoreboards[0];

      const newScoreboard = {
        id: scoreboard.id,
        solved: solved,
      };

      await this.database.updateData(this.modelName, { id: newScoreboard.id }, newScoreboard).then((value) => {
        console.log('Scoreboard updated : ' + id);
      });

      return newScoreboard;
    } catch (error) {
      console.error('Failed to update Scoreboard : ' + id);
      console.error(error);
      return null;
    }
  }
}

module.exports = ScoreboardManager;