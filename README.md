# Auth Server

## API Route

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
0. Session
```json
{
    "token" : "asfasdfasdf",
    "uuid" : "uuidadsfasdf" 
}
```

1. Account
```json
{
    "id" : "",
    "password" : "",
    "email" : "",
    "uuid" : "",
    "salt" : "",
    "verified" : "",
    "authority" : "",
}
```

2. Profile
```json
{
    "id" : "",
    "email" : "",
    "name" : "",
    "organization" : "",
    "department" : "",
}
```

3. Problem
```json
{
    "id": "",
    "name" : "",
    "description": "",
    "src" : "",
    "flag" : "",
    "link" : "",
    "score": "",
    "category" : "",
}
```

4. Contest
```json
{
    "id" : "",
    "name" : "",
    "manager" : [],
    "problems" : [],
    "begin_at" : "",
    "duration" : "",
    "participants" : []
}
```

5. Scoreboard
```json
{
    "contest_id": "",
}
```