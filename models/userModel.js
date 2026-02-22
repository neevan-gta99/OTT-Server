import userDTO from "../schemas/userSchema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { redisClient } from "../server.js";
import { razorpay } from "../razorpay/buyCoins.js";
import crypto from 'crypto';
import orderDTO from "../schemas/orderSchema.js";
import transactionDTO from "../schemas/transactionSchema.js";
import verifyPaymentDTO from "../schemas/verifyPaymentSchema.js";
import VideoTransactionDTO from "../schemas/videoTransactionSchema.js";
import razor_pay from "../utils/razorPay.js";

dotenv.config();


const getAllDataOfUser = async (req) => {

    const userName = req.body.username;

    console.log("Dekhye hau", userName)

    try {
        let userFoundInRedis = await redisClient.get(`savedUsers:${userName}`);

        let parsedData = JSON.parse(userFoundInRedis);
        if (userFoundInRedis) {
            return { code: 200, user: parsedData }
        }

        const foundUser = await userDTO.findOne({ userName });


        await redisClient.set(`savedUsers:${userName}`, JSON.stringify(foundUser),
            { EX: 1800 }
        );

        return { code: 200, user: foundUser }
    }
    catch (err) {
        throw new Error("Get Data Failed")
    }

}

const signUpUser = async (req, res) => {

    const data = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const newUser = new userDTO({
            fullName: data.fullName,
            email: data.email,
            userName: data.userName,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        try {
            const { email, userName } = req.body;

            await redisClient.sAdd("registered-usersEmails", email);
            await redisClient.sAdd("registered-userNames", userName);

            await redisClient.set(`savedUsers:${savedUser.userName}`, JSON.stringify(savedUser),
                { EX: 1800 }
            );

        } catch (err) {
            console.error("Redis save failed:", err);

            await userDTO.findByIdAndDelete(savedUser._id);

            return res.status(500).json({
                code: 500,
                message: "Sign Up failed due to cache error. DB entry rolled back.",
                error: err.message,
            });
        }

        const token = jwt.sign(
            {
                userMongoId: savedUser._id,
                userName: savedUser.userName,
                fullName: savedUser.fullName,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('userToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 3600000,
        });

        return {
            code: 200,
            message: "Sign Up successful",
            user: savedUser,
            jwt_token: token
        };


    } catch (err) {

        throw new Error("Registration Failed. Please try again => " + err);
    }
};

const userLogin = async (req, res) => {
    const { userName, password } = req.body;

    try {
        let foundUser = await redisClient.get(`savedUsers:${userName}`);

        if (foundUser) {
            const userData = JSON.parse(foundUser);
            const isMatch = await bcrypt.compare(password, userData.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Incorrect password" });
            }

            foundUser = userData;

        } else {
            foundUser = await userDTO.findOne({ userName });

            if (!foundUser) {
                return res.status(404).json({ message: "UserName does not exist" });
            }

            const isMatch = await bcrypt.compare(password, foundUser.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Incorrect password" });
            }

            await redisClient.set(`savedUsers:${foundUser.userName}`, JSON.stringify(foundUser),
                { EX: 1800 }
            );
        }

        const token = jwt.sign(
            {
                userMongoId: foundUser._id,
                userName: foundUser.userName,
                fullName: foundUser.fullName,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('userToken', token, {
            httpOnly: true,      // Prevent XSS attacks
            secure: true,        // HTTPS-only (enable in production)
            sameSite: 'None',  // CSRF protection
            maxAge: 3600000,     // 1hr expiry (auto-deletes)
        });

        return {
            code: 200,
            message: "Login successful",
            user: foundUser,
            jwt_token: token
        };


    } catch (err) {

        throw new Error("Login Failed. Please try again => " + err);
    }
};

const videoAccess = async (req) => {

    try {

        const userName = req.user.userName;

        const videoId = req.params.id;
        const exists = await redisClient.exists(`redisAccessibleIds:${userName}`);

        if (!exists) {
            return {
                code: 403,
                allowed: false,

            };
        }

        const available = await redisClient.sIsMember(`redisAccessibleIds:${userName}`, videoId);

        if (!available) {

            return {
                code: 403,
                allowed: false,

            };

        }
        return {
            code: 200,
            allowed: true,
        };

    }
    catch (err) {
        throw new Error("Not access")
    }


}

const buyVideo = async (req) => {


    const { vidcoins, vidhead } = req.body;
    const userName = req.user.userName;
    const videoId = req.params.id;


    console.log("Video Id:=>", videoId);
    try {

        const exists = await redisClient.exists(`savedUsers:${userName}`);

        if (!exists) {

            const found_User = await userDTO.findOne({ userName });

            if (found_User.coins < vidcoins) {
                return { code: 500, allowed: false };
            }

            const updateCoins = found_User.coins - vidcoins;

            const updatedUser = await userDTO.findOneAndUpdate(
                { userName },
                {
                    $addToSet: { accessibleVideosIds: videoId },
                    $set: { coins: updateCoins }
                },
                { new: true }
            );

            if (!updatedUser) {
                return { code: 500, allowed: false };
            }

            await redisClient.set(`savedUsers:${userName}`, JSON.stringify(updatedUser),
                { EX: 1800 }
            );

        }
        else {

            let rawData = await redisClient.get(`savedUsers:${userName}`);

            let parsedData = JSON.parse(rawData);

            if (parsedData.coins < vidcoins) {
                return { code: 500, allowed: false };
            }

            parsedData.coins = parsedData.coins - vidcoins;

            await redisClient.set(`savedUsers:${userName}`, JSON.stringify(parsedData),
                { EX: 1800 }
            );

            await userDTO.findOneAndUpdate(
                { userName },
                {
                    $addToSet: { accessibleVideosIds: videoId },
                    $set: { coins: parsedData.coins }
                },
                { new: true }
            );

        }


        const videoIdUpdate = await redisClient.sAdd(`redisAccessibleIds:${userName}`, videoId);

        if (!videoIdUpdate) {
            return { code: 500, allowed: false };
        }

        await VideoTransactionDTO.create({
            userName: userName,
            coins: vidcoins,
            videoId: videoId,
            videoTitle: vidhead,
            status: 'success'
        });

        return { code: 200, allowed: true };

    } catch (err) {
        console.error("Buy Failed =>", err);
        await VideoTransactionDTO.create({
            userName: userName,
            coins: vidcoins,
            videoId: videoId,
            videoTitle: vidhead,
            status: 'failed'
        });
        return { code: 500, message: "Buy Failed => ", err };
    }
};

const createBuyOrderId = async (req, res) => {
    try {
        const { username, amount, coins } = req.body;

        if (!amount || !coins) {
            return res.status(400).json({ error: 'Amount and coins are required' });
        }

        try {
            const order = await razorpay.orders.create({
                amount: amount,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            });

            const newOrder = new orderDTO({
                orderId: order.id,
                userName: username,
                amount: amount / 100,
                coins: coins,
                currency: 'INR',
                orderCreated: true,
                details: "Success!"
            });

            await newOrder.save();

            console.log("Its RazorPay Order==>>", order);

            return {
                code: 200,
                id: order.id,
                amount: order.amount,
                currency: order.currency
            };


        }
        catch (err) {
            const newOrder = new orderDTO({
                orderId: `order_failed_${username}_${Date.now()}`,
                userName: username,
                amount: amount / 100,
                coins: coins,
                currency: 'INR',
                orderCreated: true,
                details: `Failed! - ${err}`
            });

            await newOrder.save();

            return {
                code: 500,
                message: 'Reason -> ', err
            };

        }

    } catch (err) {
        return {
            code: 500,
            message: 'Reason -> ', err
        };
    }
};

const verifyPayment = async (req, res) => {
    try {

        const {
            username,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        } = req.body;

        console.log("Verifying payment for:", { username, razorpay_order_id });


        const paymentDetails = await razor_pay.fetchPaymentFromRazorpay(razorpay_payment_id);

        console.log("Details=>",paymentDetails);
        

        let paymentMethodData = paymentDetails.method


        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest('hex');

        const order = await orderDTO.findOne({ orderId: razorpay_order_id });
        if (!order) {
            return {
                code: 404,
                message: 'Order not found'
            };
        }

        const user = await userDTO.findOne({ userName: username });
        if (!user) {
            return {
                code: 404,
                message: 'User not found'
            };
        }

        // Check signature
        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {

            await verifyPaymentDTO.create({
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                status: 'failed',
                paymentMethod: null,
                failureReason: 'Invalid signature',
                failureDetails: {
                    expected: expectedSignature,
                    received: razorpay_signature
                },
                requestData: req.body,
                responseData: {
                    expectedSignature,
                    isValid,
                    message: 'Invalid signature'
                }
            });

            await transactionDTO.create({
                userName: username,
                coins: order.coins,
                description: 'Payment failed - invalid signature',
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                status: 'failed'
            });


            return {
                code: 400,
                success: false,
                message: 'Invalid payment signature', err,
            };

        }

        await transactionDTO.create({
            userName: username,
            coins: order.coins,
            description: `Purchased ${order.coins} coins`,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            status: 'success'
        });

        await verifyPaymentDTO.create({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            status: 'verified',
            paymentMethod: paymentMethodData,
            verifiedAt: new Date(),
            requestData: req.body,
            responseData: {
                expectedSignature,
                isValid,
                message: 'Payment verified successfully'
            }
        });

        user.coins += order.coins;
        await user.save();


        await redisClient.set(`savedUsers:${username}`, JSON.stringify(user),
            { EX: 1800 }
        );

        return {
            code: 200,
            success: true,
            message: 'Payment verified successfully',
            coins: user.coins
        };



    } catch (err) {
        console.error('Verify payment error:', err);

        await verifyPaymentDTO.create({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            status: 'failed',
            paymentMethod: null,
            failureReason: `Payment Verification Failed Reason - ${err}`,
            failureDetails: {
                expected: expectedSignature,
                received: razorpay_signature
            },
            requestData: req.body,
            responseData: {
                expectedSignature,
                isValid,
                message: `Payment Verification Failed Reason - ${err}`
            }
        });

        await transactionDTO.create({
            userName: username,
            coins: order.coins,
            description: `Transaction failed - Reason - ${err}`,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            status: 'failed'
        });

        return {
            code: 500,
            success: false,
            message: 'Failed to verify payment=>', err,
        };
    }
};


const user_model = { getAllDataOfUser, signUpUser, userLogin, videoAccess, buyVideo, createBuyOrderId, verifyPayment };
export default user_model;
