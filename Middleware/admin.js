const jwt=require('jsonwebtoken')
const dotenv=require('dotenv');
dotenv.config();

function Adminmiddleware(req,res,next)
{
const getToken=req.headers.authorization
const words=getToken.split(" ")
const jwtToken=words[1]
console.log(jwtToken)
console.log(process.env.JWT_SECRET)
try {
    const decodedValue = jwt.verify(jwtToken, process.env.JWT_SECRET);
    

    if (decodedValue.UserName) {
        next();
    } else {
        res.status(403).json({
            msg: "You are not authenticated"
        })
    }
} catch(e) {
    res.json({
        msg: "Incorrect inputs"
    })
}


}
module.exports=Adminmiddleware;
