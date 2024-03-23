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
