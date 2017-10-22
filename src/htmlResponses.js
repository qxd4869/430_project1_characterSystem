const fs = require('fs'); // pull in the file system module

// load files into memory
// This is a synchronous operation, so you'd only 
// want to do it on startup.
// This not the best way to load files unless you have few files.
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const background = fs.readFileSync(`${__dirname}/../client/background.jpg`);

// function to get the index page
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

// function to get css page
const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/css' });
  response.write(css);
  response.end();
};

// function to get css page
const getBackground = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/jpeg' });
  response.write(background);
  response.end();
};



// set out public exports
module.exports = {
  getIndex,
  getCSS,
  getBackground
};
