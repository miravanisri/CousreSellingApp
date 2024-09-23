const express = require('express');
const {Router} = require('express');

const app = express();
const jwt=require('jsonwebtoken')
// Middleware to parse JSON bodies
app.use(express.json());
const bcrypt=require('bcrypt')
const router=Router()

const { User,Course } = require('../db/dataBase.js');
const Usermiddleware=require('../Middleware/user.js')
const zod = require('zod');
const dotenv=require('dotenv');
dotenv.config();
console.log(process.env.USER_SECRET)
// Zod schema validation
const UserSchema = zod.object({
    UserName: zod
      .string()
      .trim()
      .email({ message: "Please provide a valid email address" }),  // Better error message
    Password: zod
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })  // Minimum 8 characters
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })  // At least one uppercase letter
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })  // At least one lowercase letter
      .regex(/\d/, { message: "Password must contain at least one digit" })  // At least one digit
      .regex(/[\W_]/, { message: "Password must contain at least one special character" }),  // At least one special character
  });
  
  

router.post('/SignUp', async (req, res) => {
  try {
    const { UserName, Password } = req.body;

    // Validate input using Zod
    const result = UserSchema.safeParse({ UserName, Password });
    if (!result.success) {
      return res.status(400).send(result.error.message);  // Return immediately after sending the response
    }

    // Check if the user already exists
    const existingAdmin = await User.findOne({ UserName });
    if (existingAdmin) {
      return res.status(400).json({ error: "User already exists" });  // Return immediately after sending the response
    }
    const hashedPassword=await bcrypt.hash(Password,10)

    // Create a new admin user
    await User.create({ UserName, Password:hashedPassword });

    res.status(200).json({ success: "User successfully created" });  // This will execute only if no error occurs
  } catch (error) {
    // Handle any unexpected errors
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});
router.get('/signIn', async (req, res) => {
    try {
      const { UserName, Password } = req.body;
  
      // Validate input using Zod
    //   const result = UserSchema.safeParse({ UserName, Password });
    //   if (!result.success) {
    //     return res.status(400).send(result.error.message);  // Return immediately after sending the response
    //   }
  
      // Find user in the database by UserName
      const user = await User.findOne({ UserName });
      if (!user) {
        return res.status(404).send("User not found");
      }

  
      // Compare the provided password with the hashed password
      const passwordMatch = await bcrypt.compare(Password, user.Password); // `user.Password` is the hashed password from the database
      if (!passwordMatch) {
        return res.status(400).send("Incorrect password");
      }
  
      // Generate JWT token if password matches
      const token = jwt.sign({ UserName: user.UserName }, process.env.USER_SECRET, { expiresIn: '1h' });

  
      // Send back the token
      res.status(200).json({ token: token });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
});

router.get('/Courses', Usermiddleware, async (req, res) => {
    try {
      // Use `lean()` to return plain JavaScript objects without adding extra Mongoose properties
      const courses = await Course.find({}).lean();
      res.json({ courses });  // Send only the plain object
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching courses" });
    }
  });
  
  router.post('/courses/:courseId', Usermiddleware, async (req, res) => {
    try {
        const Courseid = req.params.courseId;
        const getToken = req.headers.authorization;
        const words = getToken.split(" ");
        const jwtToken = words[1];
        const UserName1=jwt.decode(jwtToken)
        // Fetch the user from the database
        const user = await User.findOne({ UserName: UserName1.UserName });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the course is already in the purchased list
        const isAlreadyPurchased = user.PurchasedCourses.includes(Courseid);

        if (isAlreadyPurchased) {
            return res.status(400).json({ message: "Course already purchased" });
        }



        // Update the user's purchased courses
        await User.updateOne(
            { UserName: UserName1.UserName },
            { "$push": { PurchasedCourses: Courseid } }
        );
       
       
        

        res.json({ msg: "Purchased course successfully updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get('/PurchasedCourses',Usermiddleware,async(req,res)=>{

    const getToken=req.headers.authorization
    console.log(getToken);
    const words=getToken.split(" ")
    const jwtToken=words[1]
    const UserName1=jwt.decode(jwtToken)
    console.log(UserName1)
    const user=await User.findOne({UserName:UserName1.UserName})
    console.log(user.PurchasedCourses)
    const courses = await Course.find({
        _id: {
            "$in": user.PurchasedCourses
        }
    });

    res.json({
        courses: courses
    })



})

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Forgot password route
router.post('/forgotPassword', async (req, res) => {
  try {
    const { UserName } = req.body;
    
    // Find the user by email
    const user = await User.findOne({ UserName });
    if (!user) {
      return res.status(404).json({ message: "No user with that email found" });
    }

    // Generate a reset token (for example, a random string)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Set token expiration (e.g., 1 hour)
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save the token and expiry to the user's record
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create a reset URL (use the token in the URL)
    const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;

    // Send the reset email (using nodemailer)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME, // Your email
        pass: process.env.EMAIL_PASSWORD // Your email password
      }
    });

    const mailOptions = {
      from: 'no-reply@yourapp.com',
      to: user.UserName,
      subject: 'Password Reset Request',
      text: `You are receiving this email because you (or someone else) requested to reset the password for your account.
      Please click on the following link to reset your password:
      ${resetUrl}
      If you did not request this, please ignore this email.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Reset link sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});
router.post('/resetPassword/:token', async (req, res) => {
    try {
      const { token } = req.params;
      const { Password } = req.body;
  
      // Find the user by the reset token and check if it hasn't expired
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() } // Check if token is still valid
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
  
      // Validate the new password
      const passwordSchema = zod.object({
        Password: zod
          .string()
          .min(8, { message: "Password must be at least 8 characters long" })
          .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
          .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
          .regex(/\d/, { message: "Password must contain at least one digit" })
          .regex(/[\W_]/, { message: "Password must contain at least one special character" })
      });
  
      const result = passwordSchema.safeParse({ Password });
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(Password, 10);
  
      // Update the password and clear the reset token fields
      user.Password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
  
      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred" });
    }
  });
  


module.exports =router;
