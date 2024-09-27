# CourseApp
CourseApp is a web-based platform for managing and purchasing courses. It is built using the MongoDB, Express.js,and Node.js. The application includes an admin section for course management and a user section for purchasing and managing courses.

## Table of Contents
* Features
* Tech Stack
* Installation
* Environment Variables
* Admin Routes
* User Routes
* Security
* License

## 1. Features
* Admin:
* Sign Up / Sign In with JWT authentication
* Create, view, and manage courses
* User:
* Sign Up / Sign In with JWT authentication
* View available courses
* Purchase courses
* Reset password via email

## 2. Tech Stack
* Backend: Node.js, Express.js, MongoDB (Mongoose), Zod for input validation, JWT for authentication, bcrypt for password hashing, nodemailer for email services
* Environment: dotenv for environment variables

## 3. Installation
1. Clone the repository:

* bash Copy code git clone https://github.com/miravanisri/CourseSellingApp.git.
cd courseapp
2. Install the dependencies:

* bash Copy code
* npm install
3. Set up MongoDB by creating a database in MongoDB Atlas or your local MongoDB setup.

4. Configure your environment variables (see the Environment Variables section).

5. Start the server:

* bash Copy code
* npm start
* The backend will be running on http://localhost:3000.

## 4. Environment Variables
Create a .env file in the root of your project with the following variables:

* JWT_SECRET=your_jwt_secret_key
* USER_SECRET=your_user_secret_key
* MONGODB_URI=your_mongodb_connection_uri
* EMAIL_USERNAME=your_email@example.com
* EMAIL_PASSWORD=your_email_password


## 5. Admin Routes
* Sign Up: POST /admin/SignUp

* Request body: { "UserName": "admin@example.com", "Password": "yourPassword123!" }
* Creates a new admin account.
* Sign In: GET /admin/signIn

* Request body: { "UserName": "admin@example.com", "Password": "yourPassword123!" }
* Returns a JWT token for future authentication.
* Create Course: POST /admin/courses:Requires authentication. Use the JWT token in the Authorization header: Bearer <token>.
Request body: { "Title": "Course Title", "Description": "Course Description", "ImageLink": "image_url", "Price": 100 }
Creates a new course.
 View Courses: 
* GET /admin/Courses:Requires authentication. Returns a list of all available courses.

## 6. User Routes
* Sign Up: POST /User/SignUp.Request body: { "UserName": "user@example.com", "Password": "yourPassword123!" }
Creates a new user account.

* Sign In: GET /User/signIn.Request body: { "UserName": "user@example.com", "Password": "yourPassword123!" }
Returns a JWT token for future authentication.

* View Courses: GET /User/Courses.Requires authentication. Returns a list of available courses.
* Purchase Course: POST /User/courses/:courseId.Requires authentication. Adds a course to the user's purchased courses.
* GET /User/PurchasedCourses
Requires authentication. Returns a list of purchased courses.

## 7. Security
### i.) Forgot Password: 
* POST /User/forgotPassword:Request body: { "UserName": "user@example.com" }
Sends a password reset link to the user's email.

### ii.)  Reset Password: 
* POST /User/resetPassword/:token.Request body: { "Password": "newPassword123!" }
Resets the user's password.

* SecurityPassword Hashing: User passwords are hashed using bcrypt.

* JWT Authentication: Routes are secured with JWT tokens to verify user identity.
* Email Verification: Forgot password functionality is handled via email verification using nodemailer.

## License

This project is licensed under the MIT License.

