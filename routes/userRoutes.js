import express from 'express';
import user_controller from '../controllers/userController.js';
import validation_middleware from '../middlewares/validationMiddleware.js';
import auth_middleware from '../middlewares/authMiddleware.js';



const router = express.Router();

router.post("/check", (req, res) => {
    res.json({ message: "API Check", user: req.user });
});


router.post('/signup',  validation_middleware.userValidate, user_controller.userSignup);
router.post('/login', user_controller.userLogin);
router.post('/logout', auth_middleware.logout);
router.post('/all-data', auth_middleware.validUser, user_controller.getAllDataOfUser);
router.get('/video-access/:id', auth_middleware.validUser, user_controller.videoAccess);
router.post('/buy-video/:id', auth_middleware.validUser, user_controller.buyVideo);
router.post('/create-order', auth_middleware.validUser, user_controller.createBuyOrderId);
router.post('/verify-payment', auth_middleware.validUser, user_controller.verifyPayment);
router.post('/transactions-data', auth_middleware.validUser, user_controller.getTransactionsData);
router.post('/get-more-coins', auth_middleware.validUser, user_controller.getCoinsTransaction);
router.post('/get-more-videos', auth_middleware.validUser, user_controller.getVideosTransaction);



export default router;
