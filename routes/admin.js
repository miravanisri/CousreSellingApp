const express= require('express')
const {Router} = require('express');
const app = express();
const jwt=require('jsonwebtoken')
// Middleware to parse JSON bodies
app.use(express.json());
const bcrypt=require('bcrypt')
const router=Router()


const { Admin,Course } = require('../db/dataBase.js');
const Adminmiddleware=require('../Middleware/admin.js')
const zod = require('zod');
const dotenv=require('dotenv');
dotenv.config();
console.log(process.env.JWT_SECRET)
// Zod schema validation
const AdminSchema = zod.object({
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
    const result = AdminSchema.safeParse({ UserName, Password });
    if (!result.success) {
      return res.status(400).send(result.error.message);  // Return immediately after sending the response
    }

    // Check if the user already exists
    const existingAdmin = await Admin.findOne({ UserName });
    if (existingAdmin) {
      return res.status(400).json({ error: "User already exists" });  // Return immediately after sending the response
    }
    const hashedPassword=await bcrypt.hash(Password,10)

    // Create a new admin user
    await Admin.create({ UserName, Password:hashedPassword });

    res.status(200).json({ success: "Admin successfully created" });  // This will execute only if no error occurs
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
      // const result = AdminSchema.safeParse({ UserName, Password });
      // if (!result.success) {
      //   return res.status(400).send(result.error.message);  // Return immediately after sending the response
      // }
  
      // Find user in the database by UserName
      const user = await Admin.findOne({ UserName });
      if (!user) {
        return res.status(404).send("User not found");
      }
  
      // Compare the provided password with the hashed password
      const passwordMatch = await bcrypt.compare(Password, user.Password); // `user.Password` is the hashed password from the database
      if (!passwordMatch) {
        return res.status(400).send("Incorrect password");
      }
  
      // Generate JWT token if password matches
      const token = jwt.sign({ UserName: user.UserName }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Send back the token
      res.status(200).json({ token: token });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
});
  
router.post('/courses',Adminmiddleware,(req,res)=>{

const{Title,Description,ImageLink,Price}=req.body
Course.create({Title,Description,ImageLink,Price})
res.status(200).json({msg:"Course created successfully"})


})
router.get('/Courses', Adminmiddleware, async (req, res) => {
    try {
      // Use `lean()` to return plain JavaScript objects without adding extra Mongoose properties
      const courses = await Course.find({}).lean();
      res.json({ courses });  // Send only the plain object
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching courses" });
    }
  });
  
// Start the server

module.exports=router
