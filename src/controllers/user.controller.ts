import bcrypt from "bcryptjs";
import jwtController from "jsonwebtoken";
import { Request, Response } from "express";

import User from "../model/user";
import { bodyType } from "../types/user.type";

const cloudinary = require("../config/cloudinary");

export const userSignup = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password }: bodyType = req.body;

    if (!(email && password && first_name && last_name)) {
      return res
        .status(400)
        .json({ code: 400, message: "All input is required." });
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res
        .status(409)
        .json({ code: 409, message: "User already exist. Please Login" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptedPassword,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
    });

    const token = jwtController.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY as string,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;

    return res
      .status(201)
      .json({ code: 201, message: "User registered", data: user });
  } catch (err: any) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password }: bodyType = req.body;

    if (!email && !password) {
      return res
        .status(400)
        .json({ code: 400, message: "All input is required" });
    } else if (!email && password) {
      return res.status(400).json({ code: 400, message: "Email is required" });
    } else if (email && !password) {
      return res
        .status(400)
        .json({ code: 400, message: "Password is required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwtController.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY as string,
        {
          expiresIn: "2h",
        }
      );

      user.token = token;

      return res.status(200).json({
        code: 200,
        message: "Login successfully",
        data: { token: user.token },
      });
    } else if (user && !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ code: 400, message: "Invalid password" });
    }
    return res.status(400).json({ code: 400, message: "Invalid credential" });
  } catch (err: any) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

export const userGet = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.token;
    const user = await User.findById({ _id: user_id });
    if (user) {
      return res
        .status(200)
        .json({ code: 200, message: "User found", data: user });
    } else {
      return res.status(404).json({ code: 404, message: "User not found" });
    }
  } catch (err: any) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

export const userUpdate = async (req: any, res: Response) => {
  try {
    const { user_id } = req.token;
    const { email, password } = req.body;
    let encryptedPassword = "";
    if (password) encryptedPassword = await bcrypt.hash(password, 10);
    let temp: any = {};
    for (const key in req.body) {
      if (key === "password") temp[key] = encryptedPassword;
      else if (key === "email") temp[key] = email.toLowerCase();
      else temp[key] = req.body[key];
    }
    if (req.file) {
      const { path } = req.file;
      const uploader = async (path: any) =>
        await cloudinary.uploads(path, "kitchen-sink");
      const newPath = await uploader(path);
      temp.image = newPath.url;
    }

    const user = await User.findByIdAndUpdate({ _id: user_id }, temp, {
      new: true,
    });
    if (user) {
      return res.status(200).json({
        code: 200,
        message: "User updated successfully",
        data: user,
      });
    } else {
      return res
        .status(400)
        .json({ code: 400, message: "Failed to update user" });
    }
  } catch (err: any) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};

export const userDelete = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.token;

    const user = await User.findByIdAndDelete(user_id);
    if (user) {
      return res
        .status(200)
        .json({ code: 200, message: "User deleted successfully", data: user });
    } else {
      return res
        .status(400)
        .json({ code: 400, message: "Failed to delete user, user not found" });
    }
  } catch (err: any) {
    return res.status(500).json({ code: 500, message: err.message });
  }
};
