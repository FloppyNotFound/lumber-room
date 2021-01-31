/**
 * @param variable Name of the query param to get
 * @see https://css-tricks.com/snippets/javascript/get-url-variables/
 */
const getQueryVariable = (input: string, variable: string): string => {
  const vars = input.split("&");

  let param = "";
  for (let i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      param = pair[1];
      break;
    }
  }

  return param;
};

export default getQueryVariable;
