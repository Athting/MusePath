import app from './src/app.js'
import { connectToDB } from './src/config/db.js'
connectToDB()

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
