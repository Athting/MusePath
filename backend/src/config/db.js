import mongoose from 'mongoose'

export async function connectToDB() {
    const uri = process.env.MONGODB_URI

    if (!uri) 
        throw new Error('MONGO_URI or MONGODB_URI is required')

    await mongoose.connect(uri)
    console.log('Connected to Database')
}
