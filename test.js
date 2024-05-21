// const { encryptPassword, createSalt } = require('./modules/encrypt');
const { accountManager, contestManager, problemManager, profileManager, scoreboardManager, run } = require('./instances');
const fs = require('fs');


const createRandomAccount = () => {
  const account = {
    id: Math.random().toString(36).substring(2, 10),
    password: Math.random().toString(36).substring(2, 10),
    email: Math.random().toString(36).substring(2, 10) + '@' + Math.random().toString(36).substring(2, 10) + '.com',
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

if (!fs.existsSync('test.json')) {
  fs.writeFileSync('test.json', JSON.stringify({
    accounts: accounts,
    profiles: profiles,
    problems: problems,
    contests: contests,
    scoreboards: scoreboards
  }));
}else{
  const data = JSON.parse(fs.readFileSync('test.json'));
  accounts = data.accounts;
  profiles = data.profiles;
  problems = data.problems;
  contests = data.contests;
  scoreboards = data.scoreboards;
}

const createTest = async () => {

  const accountCreateTest = async () => {
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const accountResult = await accountManager.createAccount(account);
      const profile = profiles[i];
      const profileResult = await profileManager.createProfile(profile);
      if (accountResult.code != 0 || profileResult.code != 0) {
        console.log(accountResult, profileResult);
      }
    }
  }

  const contestCreateTest = async () => {
    for (let i = 0; i < contests.length; i++) {
      const contest = contests[i];

      const result = await contestManager.createContest(contest);
      if (result.code != 0) {
        console.log(result);
      }

      const scoreboard = scoreboards[i];
      const scoreboardResult = await scoreboardManager.createScoreboard(scoreboard);
      if (scoreboardResult.code != 0) {
        console.log(scoreboardResult);
      }
    }
  }

  const problemCreateTest = async () => {
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];

      const result = await problemManager.createProblem(problem);
      if (result.code != 0) {
        console.log(result);
      }
    }
  }

  await accountCreateTest();
  await contestCreateTest();
  await problemCreateTest();
}

const deleteAll = async () => {
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const result = await accountManager.deleteAccount({id: account.id});
    if (result.code != 0) {
      console.log(result);
    }
  }

  for(let i = 0; i < profiles.length; i++){
    const profile = profiles[i];
    const result = await profileManager.deleteProfile({id: profile.id});
    if (result.code != 0) {
      console.log(result);
    }
  }

  for (let i = 0; i < contests.length; i++) {
    const contest = contests[i];
    const result = await contestManager.deleteContest({id: contest.id});
    if (result.code != 0) {
      console.log(result);
    }
  }

  for (let i = 0; i < problems.length; i++) {
    const problem = problems[i];
    const result = await problemManager.deleteProblem({id: problem.id});
    if (result.code != 0) {
      console.log(result);
    }
  }

  for (let i = 0; i < scoreboards.length; i++) {
    const scoreboard = scoreboards[i];
    const result = await scoreboardManager.deleteScoreboard({contest: scoreboard.contest});
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
    for(let i = 0; i < problems.length; i++){
      const problem = problems[i];
      problems[i].contest = contests[i % contests.length].id;
      contests[i % contests.length].problems.push(problem.id);

      const result = await problemManager.updateProblem(problem);
      if(result.code != 0){
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
        console.log(result);
      }
    }
  }

  const addContestParticipantsTest = async () => {
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
        console.log(result);
      }
    }
  }

  const addSolvedTest = async () => {
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
          console.log(result);
        }

        const profile = profiles[j];
        profile.solved.push(solved);
        const profileResult = await profileManager.updateProfile(profile);
        if(profileResult.code != 0){
          console.log(profileResult);
        }
      }
    }
  }
  
  await accountUpdateTest();
  await addContestProblemsTest();
  await addContestParticipantsTest();
  await addSolvedTest();
}


run().then(async () => {
  await deleteAll();
  console.log('Deleted all');
  await createTest();
  console.log('Created all');
  await updateTest();
  console.log('Updated all');
});