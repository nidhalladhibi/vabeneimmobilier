import mongoose from "mongoose";

const UserAttendsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    companyName: { type: String, required: true },
    businessType: { type: String, default: "Agence" },
    address: { type: String, required: true },
    professionalEmail: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String },
    businessDescription: { type: String },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

const UserAttends = mongoose.model("UserAttends", UserAttendsSchema);
export default UserAttends;
