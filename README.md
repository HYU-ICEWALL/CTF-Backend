# CTF-Backend README

## API Endpoints

### Account

#### POST `/api/account`
Create a new `account` and `profile`. The `account` is used to login to the server and the `profile` is used to store additional information about the user.

- Request Body
<!-- table -->  
| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Account id. |
| `password` | `string` | Account password. |
| `email` | `string` | Account email. |
| `name` | `string` | Profile name. |
| `organization` | `string` | Profile organization. |
| `department` | `string` | Profile department. |

- Response
```json
{
    "code": 0,
    "data": {"id": "exampleId"}
}
```

#### POST `/api/account/login`
Login to the `account`. If the login is successful, the server will set `session` and `cookie` that can be used to access the protected resources.

- Request Body
<!-- table -->
| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Account id. |
| `password` | `string` | Account password. |

- Response
```json
{
    "code": 0,
    "data": {"id": "exampleId"}
}
```

#### GET `/api/account/logout`
Logout from the `account`. The server will invalidate the `cookie` and the client will no longer be able to access the protected resources.

- Response
```json
{
    "code": 0,
    "data": {}
}
```

#### GET `/api/account/refresh`
Refresh the `token`. The server will return a new `token` in `cookie` that can be used to access the protected resources.

- Response
```json
{
    "code": 0,
    "data": {}
}
```

#### PUT `/api/account`
Update the password of the `account`.

- Request Body
<!-- table -->
| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Account id. |
| `password` | `string` | Account password. |
| `newPassword` | `string` | Account new password. |

- Response
```json
{
    "code": 0,
    "data": {}
}
```

#### DELETE `/api/account`
Delete the `account` and `profile`. The server will remove `session` and `cookie`.

- Request Body
<!-- table -->
| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Account id. |
| `password` | `string` | Account password. |

- Response
```json
{
    "code": 0,
    "data": {}
}
```

### Contest

#### GET `/api/contest`
Get the list of `contest`.

- Request body
<!-- table -->
| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Contest id. |
| `name` | `string` | Contest name. |

- Response
```json
{
    "code": 0,
    "data": [
        {
            "id": "exampleId",
            "name": "exampleName",
            "description": "exampleDescription",
            "problems": [
                "...",
            ],
            "begin_at": "YYYY-MM-DD HH:MM:SS",
            "end_at": "YYYY-MM-DD HH:MM:SS",
            "participants": [
                "...",
            ]
        }
    ]
}
```

#### GET `/api/contest/scoreboard`
Get the `scoreboard` of the `contest`.

- Request body
<!-- table -->
| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Contest id. |

- Response
```json
{
    "code": 0,
    "data": [
        { 
            "contest": "contestId",
            "begin_at": "YYYY-MM-DD HH:MM:SS",
            "end_at": "YYYY-MM-DD HH:MM:SS",
            "solved": {
                "accountId" : [
                    "...",
                ],
                "...": [
                    "...",
                ]
            }
        }
    ]
}
```

### Problem
#### GET `/api/problem`
Get the list of `problem`.

- Request body
<!-- table -->
| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Problem id. |
| `name` | `string` | Problem name. |
| `category` | `string` | Problem category. |
| `contest` | `string` | Contest id that the problem belongs to. |

- Response
```json
{
    "code": 0,
    "data": [
        {
            "id": "exampleId",
            "name": "exampleName",
            "description": "exampleDescription",
            "source": "exampleSource",
            "flag": "exampleFlag",
            "link": "exampleLink",
            "score": "exampleScore",
            "category": "exampleCategory",
            "contest": "exampleContest"
        }
    ]
}
```

#### GET `/api/problem/flag`
Submit the `flag` of the `problem`. If the `flag` is correct, the server saves the information to `scoreboard`.

- Request body
<!-- table -->
| Field | Type | Description |
| --- | --- | --- |
| `contest` | `string` | Contest id. |
| `problem` | `string` | Problem id. |
| `flag` | `string` | Problem flag. |
| `time` | `string` | Sovled time. |

- Response (Correct)
```json
{
    "code": 0,
    "data": {
        "result": true
    }
}
```
- Response (Incorrect)
```json
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

#### PUT `/api/profile`
Update the `profile` information of the `account` with id.

- Request body
<!-- table -->
| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Account id. |
| `name` | `string` | Profile name. |
| `organization` | `string` | Profile organization. |
| `department` | `string` | Profile department. |

- Response
```json
{
    "code": 0,
    "data": {
        "id": "exampleId",
    }
}
```