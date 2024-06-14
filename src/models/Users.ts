import mongoose, { Document, Model, Schema } from "mongoose";

interface IUser extends Document {
  name: string;
  usernameTG: string;
  avatar: string;
  description: string;
  coords: [number, number];
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  usernameTG: { type: String, required: true },
  avatar: { type: String, required: false },
  description: { type: String, required: false },
  coords: {
    type: [Number],
    required: true,
    validate: {
      validator: function (value: [number, number]) {
        return value.length === 2;
      },
      message: "Coords must be an array of two numbers.",
    },
  },
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
