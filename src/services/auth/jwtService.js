import jwt from "jsonwebtoken";
import { getEnv } from "../../configs/config.js";
import { Token } from "../../models/token.model.js";

export const JWTService = () => {
  return {
    // create access token
    async accessToken(_id) {
      return jwt.sign({ _id }, getEnv("ACCESS_TOKEN_SECRET"), {
        expiresIn: getEnv("ACCESS_TOKEN_EXPIRY_TIME"),
      });
    },

    // create refresh token
    async refreshToken(_id) {
      return jwt.sign({ _id }, getEnv("REFRESH_TOKEN_SECRET"), {
        expiresIn: getEnv("REFRESH_TOKEN_EXPIRY_TIME"),
      });
    },

    // verify access token
    async verifyAccessToken(token) {
      return jwt.verify(token, getEnv("ACCESS_TOKEN_SECRET"));
    },

    // verify refresh token
    async verifyRefreshToken(token) {
      return jwt.verify(token, getEnv("REFRESH_TOKEN_SECRET"));
    },

    // store refresh token in database
    async storeRefreshToken(token) {
      try {
        await Token.create({ token });
      } catch (error) {
        throw new Error(error?.message || "Failed to store refresh token");
      }
    },

    // remove from data base
    async removeRefreshToken(token) {
      try {
        await Token.deleteOne({ token });
      } catch (error) {
        throw new Error(error?.message || "Failed to remove refresh token");
      }
    },

    // create access token
    async createVerificationToken(_id) {
      return jwt.sign({ _id }, getEnv("ACCESS_TOKEN_SECRET"), {
        expiresIn: getEnv("ACCESS_TOKEN_EXPIRY_TIME"),
      });
    },

    // verify verification token
    async verifyVerificationToken(token) {
      return jwt.verify(token, getEnv("ACCESS_TOKEN_SECRET"));
    },
  };
};
