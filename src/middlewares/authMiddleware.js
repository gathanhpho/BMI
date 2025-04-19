const jwt = require("jsonwebtoken");

const authMiddleware = (roles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log("Headers nhận được:", req.headers);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ message: "Không có token hoặc token sai định dạng!" });
    }

    const token = authHeader.split(" ")[1]; // Lấy phần token sau "Bearer"
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Không có quyền truy cập!" });
      }

      req.user = decoded;  // Gán user vào req để dùng ở các controller
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token không hợp lệ!" });
    }
  };
};

module.exports = authMiddleware;
