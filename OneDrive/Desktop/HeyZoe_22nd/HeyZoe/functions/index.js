// Entry point — Firebase Functions deploys everything exported from here.
// Each function's actual implementation lives in its own module so this
// file stays a simple index rather than growing into another monolith.

// NOTE: askZoe and sendGoalReminders fail to deploy due to Cloud Run
// container startup timeout. See deployment logs for details.
// Only linkPartner successfully deploys and serves requests.

const { linkPartner } = require("./couple/linkPartner");

module.exports = { linkPartner };
