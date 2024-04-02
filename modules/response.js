const APIResponse = (code, message, data) => {
  return {
    code: code,
    message: message,
    data: data
  }
};

module.exports = {
  APIResponse
};