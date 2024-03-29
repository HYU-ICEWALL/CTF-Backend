class ProblemManager {
  constructor(database, modelName) {
    this.database = database;
    this.modelName = modelName;
  }

  async createProblem(id, name, src, flag, link, desc, category) {
    try {
      if((await this.database.findData(this.modelName, id)) == {}){
        throw new Error('Problem already exists : ' + id);
      }

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

      return undefined;
    }
  }

  async findProblem(key){
    try {
      const problem = await this.database.findData(this.modelName, key);
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

  async deleteProblem(key){
    try {
      const problem = await this.database.getData(this.modelName, key);
      if (!problem) {
        throw new Error('Problem not found : ' + key);
      }

      await this.database.deleteData(this.modelName, key).then((value) => {
        console.log('Problem deleted : ' + key);
      });
    } catch (error) {
      console.error('Failed to delete problem : ' + key);
      console.error(error);
    }
  }
}

module.exports = ProblemManager;