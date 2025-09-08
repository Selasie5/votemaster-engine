import jwt, { verify } from "jsonwebtoken";
import { version } from "mongoose";

interface PayloadTypes {
  id: any;
  email: string;
  name: string;
}
export const JWTUtils = {
  __generateToken: (payload: PayloadTypes) => {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1hr" });
  },
  __verifyToken: (token: string, secret: string) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      return {
        status: 200,
        data: decoded,
        error: null,
      };
    } catch (error) {
      return {
        status: 500,
        data: null,
        error: "Token verification failed",
      };
    }
  },
};
