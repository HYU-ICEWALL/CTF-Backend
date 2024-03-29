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
    uuid : string           // String from AccountManager.createUuid()
    id : string,            // Account id
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
    category : number       // 0 : Web, 1 : Pwn, 2 : Reversing, 3 : Forensic, 4 :: Misc...
}
```

4. Contest
```ts
interface Contest{
    _id : ObjectId,         // Id created from mongo DB
    id : number,            // Contest id
    name : string,          // Contest name
    description: string,    // Contest description
    manager: string,        // Contest manager (account uuid or _id)
    begin_at: String,       // Contest begin time
    duration: number,       // Contest duration (minute)
    problems: number[],     // Contest problems (problem id)
    participants: string[]  // Contest participants (account uuid or _id)
}
```