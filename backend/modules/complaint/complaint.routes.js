const router = require("express").Router();

const controller = require("./complaint.controller");
const auth = require("../../middleware/auth.middleware");
const upload = require("../../utils/upload");

router.post(
 "/",
 auth,
 upload.single("image"),
 controller.createComplaint
);

router.get(
    "/my",
    auth,
    controller.getUserComplaints
);

router.get(
    "/",
    auth,
    controller.getAllComplaints
);

router.put(
 "/:id/status",
 auth,
 controller.updateStatus
);


module.exports = router;