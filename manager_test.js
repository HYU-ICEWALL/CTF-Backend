// const { encryptPassword, createSalt } = require('./modules/encrypt');
const { exit } = require('process');
const { accountManager, contestManager, problemManager, profileManager, scoreboardManager, run } = require('./instances');
const fs = require('fs');
require('dotenv').config();

const createRandomAccount = () => {
  const getRandomAlphabet = (len) => {
    const alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < len; i++) {
      result += alphabets[Math.floor(Math.random() * alphabets.length)];
    }
    return result;
  }

  const getRandomNumber = (len) => {
    const numbers = "0123456789";
    let result = "";
    for (let i = 0; i < len; i++) {
      result += numbers[Math.floor(Math.random() * numbers.length)];
    }
    return result;
  }

  const getRandomChar = (len) => {
    const chars = "!@#$%^&*()_+";
    let result = "";
    for (let i = 0; i < len; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  // // id must start with alphabet and contain only alphabet and number and length must be 6 ~ 20
  const id = getRandomAlphabet(1) + getRandomAlphabet(5) + getRandomNumber(5);
  
  // // password must contain alphabet, number, special character and length must be 8 ~ 20
  const password = getRandomAlphabet(1) + getRandomNumber(5) + getRandomChar(2) + getRandomNumber(2);

  // // email must be valid
  const email = getRandomAlphabet(5) + '@' + getRandomAlphabet(5) + '.' + getRandomAlphabet(3);

  const account = {
    id: id,
    password: password,
    email: email,
    verified: false,
    authority: 0,
  }
  return account;
}

const createRandomProfile = (account) => {
  const profile = {
    id: account.id,
    email: account.email,
    name: Math.random().toString(36).substring(2, 10),
    organization: Math.random().toString(36).substring(2, 10),
    department: Math.random().toString(36).substring(2, 10),
    solved: [],
  }
  return profile;
}

const createRandomProblem = () => {
  const problem = {
    name: Math.random().toString(36).substring(2, 10),
    description: Math.random().toString(36).substring(2, 10),
    file: Math.random().toString(36).substring(2, 10),
    flag: Math.random().toString(36).substring(2, 10),
    url: Math.random().toString(36).substring(2, 10),
    port: Math.random().toString(36).substring(2, 10),
    score: Math.floor(Math.random() * 100) + 1,
    domain: Math.random().toString(36).substring(2, 10),
    contest: Math.random().toString(36).substring(2, 10),
  }
  return problem;
}

const createRandomContest = () => {
  const contest = {
    id: Math.random().toString(36).substring(2, 10),
    name: Math.random().toString(36).substring(2, 10),
    description: Math.random().toString(36).substring(2, 10),
    problems: [],
    begin_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    end_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    participants: [],
    state: '0',
  }
  return contest;
}

const createRandomScoreboard = (contest) => {
  const scoreboard = {
    contest: contest.name,
    begin_at: contest.begin_at,
    end_at: contest.end_at,
    submissions: [],
  }
  return scoreboard;
}

let accounts = [];
let profiles = [];
let problems = [];
let contests = [];
let scoreboards = [];

const accountCount = 100;
const contestCount = 1;
const problemCount = 10;

console.log("create dummy dataset");

for (let i = 0; i < accountCount; i++) {
  const account = createRandomAccount();
  const profile = createRandomProfile(account);
  profiles.push(profile);
  accounts.push(account);
}

for (let i = 0; i < contestCount; i++) {
  const contest = createRandomContest();
  const scoreboard = createRandomScoreboard(contest);
  contests.push(contest);
  scoreboards.push(scoreboard);
}

for (let i = 0; i < problemCount; i++) {
  const problem = createRandomProblem();
  problems.push(problem);
}

const testWrapper = async (func) => {
  console.log('Start test : ' + func.name);
  try{
    if (await func()){
      console.log('Success : ' + func.name);
    }
    else{
      console.log('Failed : ' + func.name);
    }
  }catch(e){
    console.log('Error : ' + func.name);
    console.log(e);
  }
}


console.log("dummy dataset created");

const createTest = async () => {

  const accountCreateTest = async () => {
    let flag = true;
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const accountResult = await accountManager.createAccount(account, process.env.SALT_SIZE, test = true);
      if(accountResult.code != 0){
        flag = false;
        console.log(accountResult);
        continue;
      }

      const profile = profiles[i];
      const profileResult = await profileManager.createProfile(profile, test = true);
      if (profileResult.code != 0) {
        flag = false;
        console.log(profileResult);
      }
    }
    return flag;
  }

  const contestCreateTest = async () => {
    let flag = true;
    for (let i = 0; i < contests.length; i++) {
      const contest = contests[i];

      const result = await contestManager.createContest(contest, test = true);
      if (result.code != 0) {
        flag = false;
        console.log(result);
        continue;
      }

      const scoreboard = scoreboards[i];
      const scoreboardResult = await scoreboardManager.createScoreboard(scoreboard, test = true);
      if (scoreboardResult.code != 0) {
        console.log(scoreboardResult);
      }
    }
    return flag;
  }

  const problemCreateTest = async () => {
    let flag = true;
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];

      const result = await problemManager.createProblem(problem, test = true);
      if (result.code != 0) {
        flag = false;
        console.log(result);
      }
    }
    return flag;
  }

  await testWrapper(accountCreateTest);
  await testWrapper(contestCreateTest);
  await testWrapper(problemCreateTest);
}

const deleteAll = async () => {
  // delete test dummy data
  await accountManager.deleteAccounts({test: true});
  await profileManager.deleteProfiles({test: true});
  await problemManager.deleteProblems({test: true});
  await contestManager.deleteContests({test: true});
  await scoreboardManager.deleteScoreboards({test: true});  
  return;
}


const updateTest = async () => {
  const addProblemToContestTest = async () => {
    let flag = true;
    for (let i = 0; i < problems.length; i++) {
      const contest = contests[i % contests.length];
      const problem = problems[i];
      contest.problems.push(problem.name); 
      problems.contest = contest.name;
    
      const result = await problemManager.updateProblem({
        name: problem.name, 
        contest: contest.name
      });

      if (result.code != 0) {
        flag = false;
        console.log(result);
      }
    }

    for (let i = 0; i < contests.length; i++) {
      const contest = contests[i];
      const result = await contestManager.updateContest({
        name: contest.name,
        problems: contest.problems
      });
      if (result.code != 0) {
        flag = false;
        console.log(result);
      }
    }
    return flag;
  }  

  const addParticipantToContestTest = async () => {
    let flag = true;
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const contest = contests[i % contests.length];
      contest.participants.push(account.id);
    }

    for (let i = 0; i < contests.length; i++) {
      const contest = contests[i];
      const result = await contestManager.updateContest({
        name: contest.name,
        participants: contest.participants
      });
      if (result.code != 0) {
        flag = false;
        console.log(result);
      }
    }
    return flag;
  }

  
  await testWrapper(addProblemToContestTest);
  await testWrapper(addParticipantToContestTest);
  
  contests[0].participants.push("test");
  contests[0].participants.push("qwe123");

  const result = await contestManager.updateContest({
    name: contests[0].name,
    participants: contests[0].participants
  });

  if (result.code != 0) {
    console.log(result);
  }
}

const findTest = async () => {
  const findAccountTest = async () => {
    let flag = true;
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const result = await accountManager.findAccountWithPassword({id: account.id, password: account.password});
      if (result.code != 0) {
        flag = false;
        console.log(result);
        continue;
      }

      Object.keys(account).forEach(key => {
        if(key == 'password') return;
        if (account[key] instanceof String && account[key] != result.data[key]) {
          flag = false;
          console.log(account, result.data);
        }
      });
    }
    return flag;
  }

  const findProfileTest = async () => {
    let flag = true;
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const result = await profileManager.findProfiles({id: profile.id});
      if (result.code != 0) {
        flag = false;
        console.log(result);
        continue;
      }

      if (result.data.lenght == 0) {
        flag = false;
        console.log(result);
        continue;
      }
      
      Object.keys(profile).forEach(key => {
        if (profile[key] instanceof String && profile[key] != result.data[0][key]) {
          flag = false;
          console.log(profile, result.data[0]);
        }
      });
    }

    return flag;
  }

  const findProblemTest = async () => {
    flag = true;
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const result = await problemManager.findProblems({name: problem.name}, true);
      if (result.code != 0) {
        flag = false;
        console.log(result);
        continue;
      }

      if (result.data.lenght == 0) {
        flag = false;
        console.log(result);
        continue;
      }


      Object.keys(problem).forEach(key => {
        if(problem[key] instanceof String && problem[key] != result.data[0][key]){
          flag = false;
          console.log(problem, result.data[0]);
        }
      });
    }
    return flag;
  }

  const findContestTest = async () => {
    let flag = true;
    for (let i = 0; i < contests.length; i++) {
      const contest = contests[i];
      const result = await contestManager.findContests({id: contest.id});
      if (result.code != 0) {
        flag = false;
        console.log(result);
        continue;
      }

      if (result.data.lenght == 0) {
        flag = false;
        console.log(result);
        continue;
      }
      
      Object.keys(contest).forEach(key => {
        if (contest[key] instanceof String && contest[key] != result.data[0][key]) {
          flag = false;
          console.log(contest, result.data[0]);
        }
      });
    }
    return flag;
  }

  const findScoreboardTest = async () => {
    let flag = true;
    for (let i = 0; i < scoreboards.length; i++) {
      const scoreboard = scoreboards[i];
      const result = await scoreboardManager.findScoreboards({contest: scoreboard.contest});
      if (result.code != 0) {
        flag = false;
        console.log(result);
        continue;
      }

      if (result.data.lenght == 0) {
        flag = false;
        console.log(result);
        continue;
      }

      Object.keys(scoreboard).forEach(key => {
        if (scoreboard[key] instanceof String && scoreboard[key] != result.data[0][key]) {
          flag = false;
          console.log(scoreboard, result.data[0]);
        }
      });
    }
    return flag;
  }
  
  await testWrapper(findAccountTest);
  await testWrapper(findProfileTest);
  await testWrapper(findProblemTest);
  await testWrapper(findContestTest);
  await testWrapper(findScoreboardTest);
  // await findScoreboardTest();
}

run().then(async () => {
  await deleteAll();
  console.log('Deleted all');
  await createTest();
  console.log('Created all');
  await updateTest();
  console.log('Updated all');
  await findTest();
  console.log('Found all');
  exit(0);
});
