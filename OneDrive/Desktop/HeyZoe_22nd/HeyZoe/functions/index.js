// Entry point — Firebase Functions deploys everything exported from here.
// Each function's actual implementation lives in its own module so this
// file stays a simple index rather than growing into another monolith.
const { askZoe } = require("./ai/askZoe");
const { linkPartner } = require("./couple/linkPartner");
const { sendGoalReminders } = require("./reminders/sendGoalReminders");

module.exports = { askZoe, linkPartner, sendGoalReminders };
