class ProblemManager {
  constructor(database) {
    this.database = database;
  }

  createProblem(id, name, src, flag, link, desc, category) {
    try {
      const problem = {
        id: id,
        name: name,
        src: src,
        flag: flag,
        link: link,
        desc: desc,
        category: category
      }

      this.database.insertData(id, problem);
      console.log('Problem created : ' + id);

      return problem;
    } catch (error) {
      console.error('Failed to create problem : ' + id);
      console.error(error);
    }
  }

  findProblem = (key) => {
    try {
      const problem = this.database.getData(key);
      if (!problem) {
        throw new Error('Problem not found : ' + key);
      }

      return problem;
    } catch (error) {
      console.error('Failed to find problem : ' + key);
      console.error(error);
      return undefined;
    }
  }

  deleteProblem = (key) => {
    try {
      const problem = this.database.getData(key);
      if (!problem) {
        throw new Error('Problem not found : ' + key);
      }

      this.database.deleteData(key);
    } catch (error) {
      console.error('Failed to delete problem : ' + key);
      console.error(error);
    }
  }
}

module.exports = ProblemManager;