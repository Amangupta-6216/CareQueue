const mongoose = require('mongoose');
const dns = require('dns');

// On Windows / home Wi-Fi networks, local router DNS often fails SRV queries.
// Set reliable DNS servers (Google & Cloudflare) for Atlas SRV resolution.
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if running in environments where setServers is restricted
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/doctor_queue');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
