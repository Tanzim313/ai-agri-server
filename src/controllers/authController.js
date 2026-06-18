const bcrypt = require("bcryptjs");

const User = require("../models/User");

const generateToken =
require("../utils/generateToken");

exports.register = async (req, res) => {

  try {

    const {
      name,
      email,
      password
    } = req.body;

    const users =
      User.collection();

    const exists =
      await users.findOne({ email });

    if (exists) {

      return res.status(400).json({
        success: false,
        message: "User Exists"
      });

    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const result =
      await users.insertOne({
        name,
        email,
        password: hashedPassword,
        role: "farmer",
        createdAt: new Date()
      });

    res.status(201).json({
      success: true,
      token:
        generateToken(result.insertedId)
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

exports.login = async (req, res) => {

  try {

    const { email, password } =
      req.body;

    const users =
      User.collection();

    const user =
      await users.findOne({ email });

    if (!user) {

      return res.status(401).json({
        message: "Invalid Credentials"
      });

    }

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {

      return res.status(401).json({
        message: "Invalid Credentials"
      });

    }

    res.json({
      success: true,
      token:
        generateToken(user._id),
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};