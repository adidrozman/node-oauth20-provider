var async = require("async"),
  error = require("./../../error"),
  response = require("./../../util/response.js"),
  emitter = require("./../../events");

// @todo: move decision var to config
// @todo: add state

module.exports = function (req, res, client, scope, user, redirectUri) {
  var codeValue;

  async.waterfall(
    [
      // Issue new code
      function (cb) {
        req.oauth2.model.code.create(
          req.oauth2.model.user.getId(user),
          req.oauth2.model.client.getId(client),
          scope,
          req.oauth2.model.code.ttl,
          function (err, data) {
            if (err)
              cb(new error.serverError("Failed to call code::save method"));
            else {
              codeValue = data;
              req.oauth2.logger.debug("Access token saved: ", codeValue);
              cb();
            }
          }
        );
      },
    ],
    function (err) {
      if (err) response.error(req, res, err, redirectUri);
      else {
        var responseObj = { code: codeValue };
        emitter.authorization_code_granted(req, responseObj);
        response.data(req, res, responseObj, redirectUri);
      }
    }
  );
};
