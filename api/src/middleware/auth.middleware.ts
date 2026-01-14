import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const clientId = process.env.AZURE_CLIENT_ID;

  if (!clientId) {
    console.error("Missing Azure AD configuration");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    // Decode token without verification
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded || typeof decoded === "string") {
      return res.status(403).json({ error: "Invalid token format" });
    }

    const payload = decoded.payload as jwt.JwtPayload;
    
    // Verify the appid matches our client ID
    if (payload.appid !== clientId) {
      console.error("Token appid mismatch", { 
        expected: clientId, 
        received: payload.appid 
      });
      return res.status(403).json({ error: "Invalid token appid" });
    }

    // Extract user information from token
    const userInfo = {
      name: payload.name || payload.given_name || "Unknown",
      email: payload.upn || payload.unique_name || payload.email || "",
      oid: payload.oid || "",
      ...payload, // Include full payload for any additional needs
    };

    // Attach user info to request
    req.user = userInfo;
    next();
  } catch (error) {
    console.error("Token decode error:", error);
    return res.status(403).json({ error: "Invalid token" });
  }
};

