import User from "../models/User.js";

const UserRepository = (email) =>
User.findOne({ email: email }).select("+password");

export default { UserRepository };