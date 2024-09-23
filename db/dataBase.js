const mongoose=require('mongoose');
const { boolean } = require('zod');
const dotenv=require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URL)


const AdminSchema = new mongoose.Schema({
    // Schema definition here
    UserName:String,
    Password:String
    
});



const CourseSchema = new mongoose.Schema({
    // Schema definition here
    Title:String,
    Description:String,
    ImageLink:String,
    Price:Number,
   



});

const Admin = mongoose.model('Admin', AdminSchema);

const Course = mongoose.model('Course', CourseSchema);
const UserSchema = new mongoose.Schema({
    UserName: {
      type: String,
      required: true,
      unique: true
    },
    Password: {
      type: String,
      required: true
    },
    PurchasedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  });
  
const User = mongoose.model('User', UserSchema);
module.exports={Admin,User,Course}
