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
    authority: 2
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
    solved: []
  }
  return profile;
}

const createRandomProblem = () => {
  const problem = {
    id: Math.random().toString(36).substring(2, 10),
    name: Math.random().toString(36).substring(2, 10),
    description: Math.random().toString(36).substring(2, 10),
    source: Math.random().toString(36).substring(2, 10),
    flag: Math.random().toString(36).substring(2, 10),
    link: Math.random().toString(36).substring(2, 10),
    score: Math.floor(Math.random() * 100) + 1,
    category: Math.random().toString(36).substring(2, 10),
    contest: Math.random().toString(36).substring(2, 10)
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
  }
  return contest;
}

const createRandomScoreboard = (contest) => {
  const scoreboard = {
    contest: contest.id,
    begin_at: contest.begin_at,
    end_at: contest.end_at,
    solved: []
  }
  return scoreboard;
}

let accounts = [];
let profiles = [];
let problems = [];
let contests = [];
let scoreboards = [];

const accountCount = 50;
const contestCount = 1;
const problemCount = 10;

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

// if (!fs.existsSync('test.json')) {
//   fs.writeFileSync('test.json', JSON.stringify({
//     accounts: accounts,
//     profiles: profiles,
//     problems: problems,
//     contests: contests,
//     scoreboards: scoreboards
//   }));
// }else{
//   const data = JSON.parse(fs.readFileSync('test.json'));
//   accounts = data.accounts;
//   profiles = data.profiles;
//   problems = data.problems;
//   contests = data.contests;
//   scoreboards = data.scoreboards;
// }

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


const createTest = async () => {

  const accountCreateTest = async () => {
    let flag = true;
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const accountResult = await accountManager.createAccount(account, process.env.SALT_SIZE);
      if(accountResult.code != 0){
        flag = false;
        console.log(accountResult);
        continue;
      }

      const profile = profiles[i];
      const profileResult = await profileManager.createProfile(profile);
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

      const result = await contestManager.createContest(contest);
      if (result.code != 0) {
        flag = false;
        console.log(result);
        continue;
      }

      const scoreboard = scoreboards[i];
      const scoreboardResult = await scoreboardManager.createScoreboard(scoreboard);
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

      const result = await problemManager.createProblem(problem);
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
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const result = await accountManager.deleteAccounts({id: account.id});
    if (result.code != 0) {
      console.log(result);
    }
  }

  for(let i = 0; i < profiles.length; i++){
    const profile = profiles[i];
    const result = await profileManager.deleteProfiles({id: profile.id});
    if (result.code != 0) {
      console.log(result);
    }
  }

  for (let i = 0; i < contests.length; i++) {
    const contest = contests[i];
    const result = await contestManager.deleteContests({id: contest.id});
    if (result.code != 0) {
      console.log(result);
    }
  }

  for (let i = 0; i < problems.length; i++) {
    const problem = problems[i];
    const result = await problemManager.deleteProblems({id: problem.id});
    if (result.code != 0) {
      console.log(result);
    }
  }

  for (let i = 0; i < scoreboards.length; i++) {
    const scoreboard = scoreboards[i];
    const result = await scoreboardManager.deleteScoreboards({contest: scoreboard.contest});
    if (result.code != 0) {
      console.log(result);
    }
  }

  return;
}


const updateTest = async () => {
  const accountUpdateTest = async () => {
    // for (let i = 0; i < accounts.length; i++) {
    //   const account = accounts[i];
    //   const accountResult = await accountManager.updateContest({id: account.id, verified: true});
    //   if (accountResult.code != 0) {
    //     console.log(accountResult);
    //   }
    // }
  }

  const addContestProblemsTest = async () => {
    let flag = true;

    for(let i = 0; i < problems.length; i++){
      const problem = problems[i];
      problems[i].contest = contests[i % contests.length].id;
      contests[i % contests.length].problems.push(problem.id);

      const result = await problemManager.updateProblem(problem);
      if(result.code != 0){
        flag = false;
        console.log(result);
      }
    }

    for(let i = 0; i < contests.length; i++){
      const contest = contests[i];
      const result = await contestManager.updateProblems({
        id: contest.id,
        problems: contest.problems
      });
      if(result.code != 0){
        flag = false;
        console.log(result);
      }
    }
    return flag;
  }

  const addContestParticipantsTest = async () => {
    let flag = true;
    for(let i = 0; i < accounts.length; i++){
      const account = accounts[i];
      contests[i % contests.length].participants.push(account.id);
    }

    for(let i = 0; i < contests.length; i++){
      const contest = contests[i];
      const result = await contestManager.updateParticipants({
        id: contest.id,
        participants: contest.participants
      });
      if(result.code != 0){
        flag = false;
        console.log(result);
      }
    }
    return flag;
  }

  const addSolvedTest = async () => {
    let flag = true;
    for(let i = 0; i < contests.length; i++){
      const contest = contests[i];
      for(let j = 0; j < accounts.length; j++){
        const account = accounts[j];
        const solved = {
          problem: problems[j % problems.length].id,
          score: problems[j % problems.length].score,
          account: account.id,
          time: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
        const result = await scoreboardManager.addSolved({contest: contest.id, solved: solved});
        if(result.code != 0){
          flag = false;
          console.log(result);
        }

        const profile = profiles[j];
        profile.solved.push(solved);
        const profileResult = await profileManager.updateProfile(profile);
        if(profileResult.code != 0){
          flag = false;
          console.log(profileResult);
        }
      }
    }
    return flag;
  }
  
  // await testWrapper(accountUpdateTest);
  await testWrapper(addContestProblemsTest);
  await testWrapper(addContestParticipantsTest);
  await testWrapper(addSolvedTest);
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


      if (result.data.lenght == 0) {
        flag = false;
        console.log(result);
        continue;
      }
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

      if(profile.id != result.data[0].id){
        flag = false;
        console.log(profile, result.data[0]);
      }
    }

    return flag;
  }

  const findProblemTest = async () => {
    flag = true;
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const result = await problemManager.findProblems({id: problem.id});
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

      if(problem.id != result.data[0].id){
        flag = false;
        console.log(problem, result.data[0]);
      }
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

      if(contest.id != result.data[0].id){
        flag = false;  
        console.log(contest, result.data[0]);
      }
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

      if(scoreboard.contest != result.data[0].contest){
        flag = false;
        console.log(scoreboard, result.data[0]);
      }
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
