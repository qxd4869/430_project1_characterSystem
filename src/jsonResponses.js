const crypto = require('crypto');
const characters = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(characters));
let digest = etag.digest('hex');

// function to respond with a json object
// takes request, response, status code and object to send
const respondJSON = (request, response, status, object) => {
  // object for our headers
  // Content-Type for json
  // etag to version response 
  // etag is a unique versioning number of an object
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  // send response with json object
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// function to respond without json body
// takes request, response and status code
const respondJSONMeta = (request, response, status) => {
  // object for our headers
  // Content-Type for json
  // etag to version response 
  // etag is a unique versioning number of an object
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  // send response without json object, just headers
  response.writeHead(status, headers);
  response.end();
};

// get character object
// should calculate a 200 or 304 based on etag
const getCharacter = (request, response, params) => {
  if (!characters[params.name]) {
    const responseJSON = {
      getCharacterError: 'There is no such character',
    };
    return respondJSON(request, response, 404, responseJSON);
  }

  const responseJSON = {
    getCharacter: characters[params.name],
  };

  // If the version number (originally set by the server in etag)
  // is the same as our current one, then send a 304
  // 304 cannot have a body in it.
  if (request.headers['if-none-match'] === digest) {
    // return 304 response without message 
    // 304 is not modified and cannot have a body field
    // 304 will tell the browser to pull from cache instead
    return respondJSONMeta(request, response, 304);
  }

  // return 200 with message
  return respondJSON(request, response, 200, responseJSON);
};

// get meta info about character object
// should calculate a 200 or 304 based on etag
const getCharactersMeta = (request, response) => {
  // check the client's if-none-match header to see the version
  // number the client is returning (from etag)
  // If the version number (originally set by the server in etag)
  // is the same as our current one, then send a 304
  // 304 cannot have a body in it.
  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  // return 200 without message, just the meta data
  return respondJSONMeta(request, response, 200);
};

const addCharacter = (request, response, body) => {
 const responseJSON = {
    message: 'Name and age are both required.',
  };

  if (!body.name || !body.age || !body.class || !body.race) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // the default is 201
  let responseCode = 201;

  //
  if (characters[body.name]) {
    responseCode = 204;
  } else {
    characters[body.name] = {};
  }

  // throw the new characters into the object
  characters[body.name].name = body.name;
  characters[body.name].age = body.age;
  characters[body.name].race = body.race;
  characters[body.name].class = body.class;

  // creating a new hash object
  etag = crypto.createHash('sha1').update(JSON.stringify(characters));
  // recalculating the hash digest for etag
  digest = etag.digest('hex');

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

// function for 404 not found requests with message
const notFound = (request, response) => {
  // create error message for response
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  // return a 404 with an error message
  respondJSON(request, response, 404, responseJSON);
};

// function for 404 not found without message
const notFoundMeta = (request, response) => {
  // return a 404 without an error message
  respondJSONMeta(request, response, 404);
};

// set public modules
module.exports = {
  getCharacter,
  getCharactersMeta,
  addCharacter,
  notFound,
  notFoundMeta,
};
