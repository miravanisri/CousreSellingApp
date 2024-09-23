const express= require('express')
const app= express()
const adminRouter=require('./routes/admin.js')
const userRouter= require('./routes/user.js')
app.use(express.json())

app.use('/admin', adminRouter)
app.use('/User',userRouter)


app.listen(3000,()=>{console.log('listening on port 3000')})




