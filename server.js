// BASE SETUP
// ======================================

// CALL THE PACKAGES --------------------
var express    = require('express'),        // call express
app            = express(),                 // define our app using express
bodyParser     = require('body-parser'),    // get body-parser. will let us pull POST content from our HTTP request so that we can do things like create a user.
mongoose       = require('mongoose'),
config         = require('./config'),
path           = require('path'),
scribe         = require('scribe-js')(),    // used for logs
favicon        = require('serve-favicon'),  // set favicon
console        = process.console;

/*app.get('/', function(req, res) {
	res.send('Hello world, see you at /logs');
});*/

/** ===========
*   = LOGGING =
*   = =========
*   set up logging framework in the app
*/
app.use(scribe.express.logger());

app.use('/logs', scribe.webPanel());

/** ================
*   = STATIC FILES =
*   = ==============
*   set static files location used for requests that our frontend will make
*/
app.use(express.static(__dirname + '/public'));

/** =================
*   = SERVE FAVICON =
*   = ===============
*   serve the favicon.ico so that modern browsers will show a "tab" and favorites icon
*/
app.use(favicon(path.join(__dirname, 'public', 'assets', 'images', 'favicon.ico')));

/** ==================
*   = ROUTES FOR API =
*   = ================
*   set the routes for our server's API
*/
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

/** =============
*   = FRONT-END =
*   = ===========
*   Main 'catch-all' route to send users to frontend
*/
/* NOTE(thatkookooguy): has to be registered after API ROUTES */
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

/** ==========
*   = SERVER =
*   = ========
*/
app.listen(config.port, function() {
	console.time().info('Server listening at port ' + config.port);
});