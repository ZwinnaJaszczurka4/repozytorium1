import "dotenv/config";
import { createAdmin } from "/home/student/repozytorium1/models/user.js";

const user = await createAdmin("admin", "admin123");

console.log(user);