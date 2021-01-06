/**
 * Gets dropbox access token from browser URL hash.
 * If the user was just redirected from authenticating, the urls hash will contain the access token.
 * @param str Auth Query String returned from Dropbox authentication
 * @see https://github.com/dropbox/dropbox-sdk-js/blob/main/examples/javascript/utils.js
 */
const parseAuthQueryString = (
  str: string
): { access_token: string } | Object => {
  var ret: { [k: string]: string[] | string } = Object.create(null);

  if (typeof str !== "string") {
    return ret;
  }

  str = str.trim().replace(/^(\?|#|&)/, "");

  if (!str) {
    return ret;
  }

  str.split("&").forEach(function (param) {
    var parts = param.replace(/\+/g, " ").split("=");
    // Firefox (pre 40) decodes `%3D` to `=`
    // https://github.com/sindresorhus/query-string/pull/37
    var key = parts.shift();
    var val = parts.length > 0 ? parts.join("=") : undefined;

    key = decodeURIComponent(key);

    // missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    val = val === undefined ? null : decodeURIComponent(val);

    var retVal = ret[key];
    if (ret[key] === undefined) {
      ret[key] = val;
    } else if (Array.isArray(retVal)) {
      retVal.push(val);
    } else {
      ret[key] = [<string>ret[key], val];
    }
  });

  return ret;
};

export default parseAuthQueryString;
