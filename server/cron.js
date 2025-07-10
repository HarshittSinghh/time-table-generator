const axios = require("axios");

setInterval(() => {
  axios.get("https://time-table-generator-6abp.onrender.com/api/timetable")
    .then(() => console.log(`[${new Date().toLocaleTimeString()}]  Pinged successfully`))
    .catch(err => console.error(`[${new Date().toLocaleTimeString()}]  Ping failed:`, err.message));
}, 5 * 60 * 1000);

axios.get("https://time-table-generator-6abp.onrender.com/api/timetable")
  .then(() => console.log(`[${new Date().toLocaleTimeString()}] Initial ping successful`))
  .catch(err => console.error(`[${new Date().toLocaleTimeString()}] Initial ping failed:`, err.message));
