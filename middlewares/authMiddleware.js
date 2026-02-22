import jwt from "jsonwebtoken";

const validUser = (req, res, next) => {

  try {
    const token = req.cookies.userToken;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded;

    
    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

};



const logout = (req, res) => {
  try {
    res.clearCookie('userToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/'
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};


const auth_middleware = { logout, validUser };
export default auth_middleware;