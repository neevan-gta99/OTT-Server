import user_model from "../models/userModel.js";

const getAllDataOfUser = async (req, res) => {

  try {

    const userRes = await user_model.getAllDataOfUser(req, res);

    res.status(userRes.code).json({ message: userRes.message, userData: userRes.user })

  } catch (err) {
    res.status(500).json({ message: "Error in Registration: ", details: err.message });
  }


}

const userSignup = async (req, res) => {
  try {

    const userRes = await user_model.signUpUser(req, res);

    res.status(userRes.code).json({ message: userRes.message, token: userRes.jwt_token, userData: userRes.user })

  } catch (err) {
    res.status(500).json({ message: "Error in Registration: ", details: err.message });
  }
};

const userLogin = async (req, res) => {
  try {

    const userRes = await user_model.userLogin(req, res);

    res.status(userRes.code).json({ message: userRes.message, token: userRes.jwt_token, userData: userRes.user })

  } catch (err) {
    res.status(500).json({ message: "Error in Registration: ", details: err.message });
  }
};


const videoAccess = async (req, res) => {


  try {

    const userRes = await user_model.videoAccess(req, res);

    res.status(userRes.code).json({ allowed: userRes.allowed })

  } catch (err) {
    res.status(500).json({ message: "Error in Buying Video ", details: err.message });
  }

}

const buyVideo = async (req, res) => {

  const videoId = req.params.id;

  console.log("Video Id:=>", videoId);


  try {

    const userRes = await user_model.buyVideo(req, res);

    res.status(userRes.code).json({ allowed: userRes.allowed })

  } catch (err) {
    res.status(500).json({ message: "Error in Buying Video ", details: err.message });
  }

}

const createBuyOrderId = async (req, res) => {

  try {

    const userRes = await user_model.createBuyOrderId(req, res);

    res.status(userRes.code).json({ id: userRes.id, amount: userRes.amount, currrency: userRes.currrency })

  } catch (err) {
    res.status(500).json({ message: "Error in creating buy order!", details: err.message });
  }

}
const verifyPayment = async (req, res) => {

  try {

    const userRes = await user_model.verifyPayment(req, res);

    res.status(userRes.code).json({ success: userRes.success, message: userRes.message, coins: userRes.coins })

  } catch (err) {
    res.status(500).json({ success: userRes.success, message: "Error in Verify Payment ", details: err.message });
  }

}







const user_controller = { getAllDataOfUser, userSignup, userLogin, videoAccess, buyVideo, createBuyOrderId, verifyPayment };

export default user_controller;