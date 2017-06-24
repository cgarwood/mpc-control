# MPC-Control

MPC-Control provides a customizable web interface to control Martin M-PC through the Martin M-Series Manager program. It expands upon the built-in M-Series Manager web server and allows for more design options, and allows tablets to be locked out. Originally intended so people could use the tablets to turn on house lighting or simple stage light scenes during the week without needing to use the lighting console.

**PLEASE NOTE**: Most customization currently requires modifying source files and re-compiling with `webpack`

### Requirements

 * Martin M-PC
 * Martin M-Series Manager with Telnet server enabled
 * NodeJS Server


### Installation

* Install NodeJS and NPM
* Clone this github repository
* Run `npm install` from the mpc-control directory to install node modules
* If you modify any templates etc. from the `src` directory, run `webpack` from the mpc-control directory
* Rename `server/server-config-example.js` to `server-config.js` and update the settings in the file to match your environment
* Rename `config.example.js` to `config.js` and update the settings to match your environment
* Start the server `node server/server.js`

### Other Notes

* To customize the controls page to match your environment, edit `src/pgControls.vue`. You will need to re-compile with `webpack` after editing.
* Copy an image named background.jpg into the `static` folder to customize the background
