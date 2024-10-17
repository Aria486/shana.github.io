// models/User.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

// 定义 TypeScript 接口
export interface IUser extends Document {
  name: string;
  email: string;
  age?: number;
}

// 定义 Mongoose 模型
const userSchema: Schema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number }
});

// 防止模型重复创建
const User = models.User || model<IUser>("User", userSchema);

export default User;
