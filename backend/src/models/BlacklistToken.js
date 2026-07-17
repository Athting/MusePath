import mongoose from 'mongoose'

const BlacklistTokenSchema = new mongoose.Schema(
    {
        token: { 
            type: String, 
            required: true, 
            unique: true, 
            index: true 
        }
    },
    { timestamps: true }
)

export const BlacklistToken = mongoose.model('BlacklistToken', BlacklistTokenSchema)
