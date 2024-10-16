var mysql = require("mysql");
var pool = mysql.createPool({
host: "tuxa.sme.utc", //ou localhost
user: "sr10p017",
password: "5anNpeE4P4F0",
database: "sr10p017"
});
module.exports = pool;