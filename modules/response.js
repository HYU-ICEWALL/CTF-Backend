class APIResponse {
  constructor(code, data) {
    this.code = code;
    this.data = data;
  }
}

class APIError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
}

/*
  code 0 : Success
  

  code 1xx : account manager error
  - code 100 : Failed to create account

  - code 110 : Failed to find account with id
  - code 111 : Account not found
  - code 112 : Account duplicated
  
  - code 120 : Failed to find account
  - code 121 : Account not found
  - code 122 : Account duplicated
  - code 123 : Password not matched

  - code 130 : Failed to delete account
  - code 131 : Failed to find account to delete

  - code 140 : Failed to change password
  - code 141 : Account not found
  - code 142 : Account duplicated
  - code 143 : Password not matched

  
  code 2xx : contest manager error
  - code 200 : Failed to create contest

  - code 210 : Failed to find contests

  - code 220 : Failed to delete contest
  
  - code 230 : Failed to update contest
  
  code 3xx : problem manager error
  - code 300 : Failed to create problem
  - code 310 : Failed to find problems
  - code 320 : Failed to delete problem
  - code 330 : Failed to update problem

  code 4xx : profile manager error
  - code 400 : Failed to create profile

  - code 410 : Failed to find profile
  - code 411 : Profile not found
  - code 412 : Profile duplicated

  - code 420 : Failed to delete profile

  - code 430 : Failed to update profile

  code 5xx : scoreboad manager error
  - code 500 : Failed to create scoreboard
  
  - code 510 : Failed to find scoreboard
  - code 511 : Scoreboard not found
  - code 512 : Scoreboard duplicated

  - code 520 : Failed to delete scoreboard

  - code 530 : Failed to update scoreboard

  code 6XX : session & token error
  - code 601 : Session found
  - code 602 : Session not found
  - code 603 : Session save failed
  - code 604 : Session destroy failed
  - code 605 : Session refresh failed

  - code 611 : Cookie malformed


  code 7xx : database error
  - code 700 : Failed to insert data

  - code 710 : Failed to find data
  
  - code 720 : Failed to update data
  
  - code 730 : Failed to delete data
  - code 731 : No matched data to delete

  code 8xx : router error
  - code 800 : Invalid parameters
  - code 801 : Permission denied

  - code 81X : account router error
    - code 810 : Account register failed
    - code 811 : Account login failed
    - code 812 : Account logout failed
    - code 813 : Account refresh failed
    - code 814 : Account withdraw failed
    - code 815 : Account change password failed

  - code 82X : contest router error
    - code 820 : Contest create failed
    - code 821 : Contest find failed
    - code 822 : Contest delete failed
    - code 823 : Contest update failed
    - code 824 : Failed to create scoreboard
    - code 825 : Failed to find scoreboard
    - code 826 : Failed to delete scoreboard
    - code 827 : Failed to update scoreboard

  - code 83X : problem router error
    - code 830 : Problem create failed
    - code 831 : Problem find failed
    - code 832 : Problem delete failed
    - code 833 : Problem update failed
    - code 834 : Problem to check flag not found
    - code 835 : Flag incorrect
    - code 836 : Problem to check flag failed

  - code 84X : profile router error
    - code 840 : Profile create failed
    - code 841 : Profile find failed
    - code 842 : Profile delete failed
    - code 843 : Profile update failed
*/

module.exports = {
  APIResponse,
  APIError,
};