class ProblemManager {
  constructor(database, modelName) {
    this.database = database;
    this.modelName = modelName;
  }

  async createProblem(id, name, src, flag, link, desc, category) {
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

      await this.database.insertData(this.modelName, problem).then(() => {
        console.log('Problem created : ' + id);
      });

      return problem;
    } catch (error) {
      console.error('Failed to create problem : ' + id);
      console.error(error);

      return null;
    }
  }

  async findProblems(key){
    try {
      const problems = await this.database.findData(this.modelName, key);
      return problems;
    } catch (error) {
      console.error('Failed to find problem : ' + key);
      console.error(error);
      return null;
    }
  }

  async deleteProblem(id){
    try {
      const problems = await this.database.getData(this.modelName, {id: id});
      if (problems.length === 0) {
        throw new Error('Problem not found : ' + id);
      }

      if(problems.length > 1){
        throw new Error('Problem is duplicated : ' + id);
      }

      await this.database.deleteData(this.modelName, {id: id}).then((value) => {
        console.log('Problem deleted : ' + id);
      });

      return true;
    } catch (error) {
      console.error('Failed to delete problem : ' + id);
      console.error(error);
      return false;
    }
  }

  async updateProblem(id, name, src, flag, link, desc, category){
    try {
      const problems = await this.database.findData(this.modelName, {id: id});
      if (problems.length === 0) {
        throw new Error('Problem not found : ' + id);
      }

      if(problems.length > 1){
        throw new Error('Problem is duplicated : ' + id);
      }
      const newProblem = {
        id: id,
        name: name,
        src: src,
        flag: flag,
        link: link,
        desc: desc,
        category: category
      }
      await this.database.updateData(this.modelName, {id: id}, newProblem).then((value) => {
        console.log('Problem updated : ' + id);
      });

      return newProblem;
    } catch (error) {
      console.error('Failed to update problem : ' + id);
      console.error(error);
      return null;
    }
  }
}

module.exports = ProblemManager;