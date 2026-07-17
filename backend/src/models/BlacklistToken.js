import mongoose from 'mongoose'

const BlacklistTokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true, unique: true, index: true },
        expiresAt: { type: Date, required: true, expires: 0 }
    },
    { timestamps: true }
)

export const BlacklistToken = mongoose.model('BlacklistToken', BlacklistTokenSchema)

