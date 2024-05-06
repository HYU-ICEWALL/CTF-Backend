# Auth Server

## API Route

### /api/account

|URL|Method|Response Format|Description| 
|---|---|---|---|
|`/api/account/register`|POST|JSON|Create account.|
|`/api/account/login`|POST|JSON|Login account.|
|`/api/account/logout`|POST|JSON|Logout account. Delete session.|
|`/apiaccount/refresh`|POST|JSON|Refresh session token|
|`/api/account/withdraw`|POST|JSON|Delete account.|
|`/api/account/change-password`|POST|JSON|Change account password into new password.|

### POST /account/register
```json
body{
    "id": "test",
    "password" : "testpassword",
    "email" : "test@example.com"
}
```

### POST /account/login
```json
body{
    "id": "test",
    "password" : "testpassword",
}
```
### POST /account/logout
```json
body{
    
}
```
### POST /account/refresh
```json
body{
    
}
```
### POST /account/withdraw
```json
body{
    "id": "test",
    "password" : "testpassword",
}
```
### POST /account/change-password
```json
body{
    "id": "test",
    "password" : "testpassword",
    "newPassword" : "newtestpassword"
}
```

## Schema
0. Session : User direct access NOT allowed
```ts
interface Session{ 
    token : string,         // String from SessionManager.createSessionToken()
    account : Account,       // Account object
}
```

1. Account : User direct access NOT allowed
```ts
interface Account {
    _id: ObjectId,          // Id created from mongo DB
    id: string,             // Account id
    password: string,       // Password must be encrypted with salt
    salt: string,           // String from createSalt() in encrypt.js
    uuid: string,           // String from AccountManager.createUuid()
    email: string, 
    verified: boolean,      // Default : false
    authority : number      // 0 : User, 1 : Admin
}
```

2. Profile
```ts
interface Profile{
    _id : ObjectId,         // Id created from mongo DB
    id : string,            // Account id
    email : string,         // Account email
    name: string,           // User name
    organization: string,   // User organization (ex. University, Company)
    department: string,     // User department (ex. major, division)
}
```

3. Problem
```ts
interface Problem{
    _id : ObjectId,         // Id created from mongo DB
    id: number,             // Problem id
    name : string,          // Problem name
    description: string,    // Problem description
    source : string,           // Problem source (download)
    flag : string,          // Problem flag (answer)
    link : string,          // Problem link (ex. web, pwn)
    score: number,          // Problem score
    category : number       // 0 : Web, 1 : Pwn, 2 : Reversing, 3 : Forensic, 4 : Misc...
}
```

4. Contest
```ts
interface Contest{
    _id : ObjectId,         // Id created from mongo DB
    id : number,            // Contest id
    name : string,          // Contest name
    description: string,    // Contest description
    manager: string,        // Contest manager (account id)
    begin_at: String,       // Contest begin time
    duration: number,       // Contest duration (minute)
    problems: number[],     // Contest problems (problem id)
    participants: string[],  // Contest participants (account id)
    scoreboard: number,     // Contest scoreboard (scoreboard id)
}
```

5. Scoreboard
```ts
interface Scoreboard{
    _id : ObjectId,         // Id created from mongo DB
    id : number,            // Contest id
    solved : Score[],       // Solved problems
}
```

6. Score
```ts
interface Score{
    _id : ObjectId,         // Id created from mongo DB
    account : string,       // Account id
    problem: number,        // Problem id
    score: number,          // Problem score
    timestamp: string,      // Problem solved time
}
```

5. Scoreboard
```ts
interface Scoreboard{
    _id : ObjectId,         // Id created from mongo DB
    id : number,            // Contest id
    name : string,          // Contest name
    scores : Score[]        // Contest scores
}
```

6. Score
```ts
interface Score{
    _id : ObjectId,         // Id created from mongo DB
    id : number,            // Contest id
    account : string,       // Account id
    score : number,         // Account score
    time : number           // Account time
}
```


### Architecture

1. Database Module
- database.js
    - insert : Insert data.
    - find : Find data.
    - update : Update data.
    - delete : Delete data.
2. Manager Module
- accountManager.js
    - createAccount : Create account with id and password. Insert account into dbms. Return account if success, null if fail.
    - findAccountWithId : Find account with id. Return account id to object if success, null if fail.
    - findAccount : Find account with id and password. Return account if success, null if fail.
    - updateAccount : Create new account with id and new password and update. Return new account if success, null if fail.
    - deleteAccount : Delete account with id and password. Return true if success, false if fail.
- profileManager.js
    - createProfile : Create profile with id and email. Insert profile into dbms. Return profile if success, null if fail.
    - findProfiles : Find profiles with `{key : value}`. Return profile if success, null if fail.
    - updateProfile : Create new profile with id and update. Return new profile if success, null if fail.
    - deleteProfile : Delete profile with id. Return true if success, false if fail.
- problemManager.js
    - createProblem : Create problem. Insert problem into dbms. Return problem if success, null if fail.
    - findProblems : Find problems with `{key : value}`. Return problem if success, null if fail.
    - updateProblem : Create new problem and update. Return new problem if success, null if fail.
    - deleteProblem : Delete problem with id. Return true if success, false if fail.
- contestManager.js
    - createContest : Create contest. Insert contest into dbms. Return contest if success, null if fail.
    - findContests : Find contests with `{key : value}`. Return contest if success, null if fail.
    - updateContest : Create new contest and update. Return new contest if success, null if fail.
    - deleteContest : Delete contest with id. Return true if success, false if fail.

3. Router Module