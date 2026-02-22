import { redisClient } from '../server.js'


const userValidate = async (req, res, next) => {
  try {
    const { email, userName } = req.body;

    const emailExists = await redisClient.sIsMember("registered-usersEmails", email);
    if (emailExists) {
      return res.status(400).json({ message: "You are already a part of this platform (Already Registered)" });
    }

    const userNameExists = await redisClient.sIsMember("registered-userNames", userName);
    if (userNameExists) {
      return res.status(400).json({ message: "userName already taken" });
    }

    

  } catch (err) {
    console.error("Validation middleware error:", err);
    res.status(500).json({ message: "Server error during validation" });
  }

  // console.log("vaildation check");

  next();
};

const validation_middleware = { userValidate };
export default validation_middleware;
