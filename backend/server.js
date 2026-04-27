const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./modules/auth/auth.routes");
const complaintRoutes = require("./modules/complaint/complaint.routes");
const { sendError } = require("./utils/error");

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth",authRoutes);
app.use("/api/complaints",complaintRoutes);
app.use("/uploads",express.static("uploads"));

app.get("/", (req,res)=>{
 res.send("Public Complaint System API Running");
});

app.use((req, res) => {
 return sendError(res, {
  status: 404,
  message: `Route not found: ${req.method} ${req.originalUrl}`,
  code: "ROUTE_NOT_FOUND"
 });
});

app.use((error, req, res, next) => {
 return sendError(res, {
  status: 500,
  message: "Unexpected server error",
  code: "UNEXPECTED_SERVER_ERROR",
  error
 });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
 console.log(`Server running on port ${PORT}`);
});