# CTF-Backend README

## Schema

### Account
```js
const accountSchema = new Schema({
  id: { type: String, unique: true, required: true},
  password: { type: String, required: true},
  salt: { type: String, required: true},
  email: { type: String, unique: true, required: true},
  verified: { type: Boolean, required: true, default: false },
  authority: { type: Number, required: true, default: 0 },
  test: { type: Boolean, required: true, default: false },
});

module.exports = accountSchema;
```

### Contest
```js
const contestSchema = new Schema({
  name: { type: String, unique: true, required: true },
  description: { type: String },
  problems: { type: [String], required: true},  // problem name
  begin_at: { type: String, required: true },
  end_at: { type: String, required: true },
  participants: { type: [String], required: true }, // account id
  state: { type: String, required: true, default: '0' }, // 0 : upcoming, 1 : in progress, 2 : ended, 3 : suspended
  test: { type: Boolean, required: true, default: false },
});
```

### Problem
```js
const problemSchema = new Schema({
  name: { type: String, unique: true, required: true },
  description: { type: String },
  file: { type: String },
  flag: { type: String },
  url: {type: String},
  port: {type: String},
  score: { type: String, required: true },
  domain: { type: String, required: true }, // pwn, web, forensic, reverse, misc
  contest: { type: String }, // contest name
  test: { type: Boolean, required: true, default: false },
});
```

### Profile
```js
const profileSchema = new Schema({
  id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true},
  name: { type: String, required: true },
  organization: { type: String, required: true },
  department: { type: String, required: true },
  solved: { type: [Schema.ObjectId], default: [] },
  test: { type: Boolean, required: true, default: false },
});

/*
solved : [
  {
    problem : problem id,
    score : problem score,
    account : account id,
    time : time (YYYY-MM-DD HH:MM:SS)
  }
]
*/
```

### Scoreboard
```js
const scoreboardSchema = new Schema({
  contest: { type: String, unique: true, required: true }, // contest name
  begin_at: { type: String, required: true },
  end_at: { type: String, required: true },
  sumbissions: { type: [Object], default: [] },
  test: { type: Boolean, required: true, default: false }
});

/*
submission : [
  {
    problem : problem _id,
    score : problem score,
    account : account _id,
    type : true / false,
    time : time (YYYY-MM-DD HH:MM:SS)
  }
]
*/
```


## API Endpoints

### Account

#### POST `/api/account`
- 계정 생성 후 프로필 생성을 한다.
- 세션이 있으면 실패한다.

- Request Body
```json
{
    "id": "exampleId",
    "password": "examplePassword",
    "email": "exampleEmail",
    "name": "exampleName",
    "organization": "exampleOrganization",
    "department": "exampleDepartment"
}
```

- Response
```json
{
    "code": 0,
    "data": {}
}
```

#### POST `/api/account/login`
- 계정 로그인을 한다.
- 세션을 생성하고 쿠키에 저장한다.
- 세션에는 ID와 Token이 저장된다.

- Request Body
```json
{
    "id": "exampleId",
    "password": "examplePassword"
}
```

- Response
```json
{
    "code": 0,
    "data": {}
}
```

#### GET `/api/account/auth`
- 유효한 세션인지 확인한다.

- Response
```json
{
    "code": 0,
    "data": {}
}
```

#### GET `/api/account/logout`
- 계정 로그아웃을 한다.
- 세션을 제거하고 쿠키를 제거한다.

- Response
```json
{
    "code": 0,
    "data": {}
}
```

#### GET `/api/account/refresh`
- 계정 토큰을 갱신한다.

- Response
```json
{
    "code": 0,
    "data": {}
}
```

#### PUT `/api/account`
- 유효한 세션인지 확인한다.
- 계정 비밀번호를 변경한다.

- Request Body
```json
{
    "id": "exampleId",
    "password": "examplePassword",
    "newPassword": "exampleNewPassword"
}
```

- Response
```json
{
    "code": 0,
    "data": {}
}
```

#### DELETE `/api/account`
- 유효한 세션인지 확인한다.
- 계정과 프로필을 삭제한다.

- Request Body
```json
{
    "id": "exampleId",
    "password": "examplePassword"
}
```

- Response
```json
{
    "code": 0,
    "data": {}
}
```

### Contest

#### GET `/api/contest/recent`
- 최근에 진행된 `contest`를 `count`만큼 가져온다.

- Parameters
```json
{
    "count": 5
}
```

- Response
```json
{
    "code": 0,
    "data": {
        "recent" : [...],
        "upcoming" : [...],
        "inprogress" : [...],
        "ended" : [...]
    }
}
```

#### GET `/api/contest`
- `contest`의 정보를 가져온다.
- `name`이 있으면 해당 이름을 가진 `contest`를 가져온다.
- `name`이 있고 세션이 유효하며 `contest`의 `participants`에 속하면 `problems`나 `scoreboards`를 가져올 수 있다.

- Parameters
```json
{
    "name": "exampleContest",
    "problems": true,
    "scoreboards": true
}
```

- Response
```json
// no params
{
    "code": 0,
    "data": [
        // contests
    ]
}

// only name
{
    "code": 0,
    "data": {
        // contest info
    }
}

// problems or scoreboards
{
    "code": 0,
    "data": {
        // contest info
        "problems": [
            // problems
        ],
        "scoreboard": {
            // scoreboard
        }
    }
}
```

#### GET `/api/contest/scoreboard`
- `contest`의 `scoreboard`를 가져온다.
- 세션이 유효하며 `contest`의 `participants`에 속하면 가져올 수 있다.

- Parameters
```json
{
    "name": "exampleContest"
}
```

- Response
```json
{
    "code": 0,
    "data": { 
        "contest": "exampleContest",
        "begin_at": "YYYY-MM-DD HH:MM:SS",
        "end_at": "YYYY-MM-DD HH:MM:SS",
        "submissions": [
            {
                "accountId" : {
                    "total": 0,
                    "timestamp": [
                        {
                            "problem": "exampleProblem",
                            "score": 0,
                            "type": true,
                            "time": "YYYY-MM-DD HH:MM:SS"
                        },
                        ...
                    ]
                },
                ...
            }
        ]
    }
}
```

### Problem
#### GET `/api/problem`
- 문제 목록을 가져온다.

- Parameters
```json
{
    "name": "exampleName",
    "category": "exampleCategory",
    "contest": "exampleContest"
}
```

- Response
```json
{
    "code": 0,
    "data": [
        // problems
    ]
}
```

#### POST `/api/problem/submit`
- 세션이 유효한지 확인한다
- `flag`를 확인한다.
- `profile`의 `solved`에 추가한다.
- `contest`의 시간이 `begin_at`과 `end_at` 사이인지 확인한다.
- `contest`의 `participants`에 속하는지 확인한다.
- `contest`의 `scoreboard`에 추가한다.

- Request Body
```json
{
    "name": "exampleProblem",
    "flag": "exampleFlag"
}
```

- Response (Correct)
```json
// solved
{
    "code": 0,
    "data": {
        "result": true
    }
}
// not solved
{
    "code": 0,
    "data": {
        "result": false
    }
}
```

### Profile

#### GET `/api/profile`
Get the `profile` information of the `account`.

- Request body
<!-- table -->
| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Account id. |

- Response
```json
{
    "code": 0,
    "data": {
        "id": "exampleId",
        "email": "exampleEmail",
        "name": "exampleName",
        "organization": "exampleOrganization",
        "department": "exampleDepartment"
    }
}
```

#### GET `/api/profile`
- 프로필 정보를 가져온다.

- Parameters
```json
{
    "id": "exampleId"
}
```

- Response
```json
{
    "code": 0,
    "data": [
        // profiles
    ]
}
```

#### PUT `/api/profile`
- 유효한 세션인지 확인한다.
- 프로필을 수정한다.

- Request body
```json
{
    "name": "exampleName",
    "organization": "exampleOrganization",
    "department": "exampleDepartment"
}
```

- Response
```json
{
    "code": 0,
    "data": {}
}
```

### GET `/api/profile/solved`
- 프로필의 `solved`를 가져온다.

- Parameters
```json
{
    "id": "exampleId"
}
```

- Response
```json
{
    "code": 0,
    "data": [
        // solved
    ]
}
```
