import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { validateCreateBooking, validateReschedule, validateCancel } from "../validators/booking.validator.js";
import {
    createBooking,
    getCalendar,
    cancelBooking,
    rescheduleBooking,
    listBookings,
} from "../controllers/booking.controller.js";

const router = Router();

router.use(verifyJWT);

// GET /api/bookings/calendar — must come before /:id routes
router.get("/calendar", getCalendar);

router
    .route("/")
    .get(listBookings)
    .post(validate(validateCreateBooking), createBooking);

router.patch("/:id/cancel", validate(validateCancel), cancelBooking);
router.patch("/:id/reschedule", validate(validateReschedule), rescheduleBooking);

export default router;
