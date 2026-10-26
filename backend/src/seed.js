const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const QueueEntry = require('./models/QueueEntry');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/doctor_queue';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    const shouldReset = process.argv.includes('--reset') || process.argv.includes('--force');

    if (shouldReset) {
      console.log('🧹 Reset requested: Clearing existing collections...');
      await User.deleteMany({});
      await Doctor.deleteMany({});
      await Appointment.deleteMany({});
      await QueueEntry.deleteMany({});
    } else {
      console.log('🛡️ Safe mode: Preserving existing registered users, patients, and appointments.');
    }

    console.log('🔑 Hashing default passwords...');
    const defaultPassword = await bcrypt.hash('Password123', 10);
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const recepPassword = await bcrypt.hash('Recep@123', 10);

    // 1. Create Super Admin if not exists
    let adminUser = await User.findOne({ email: 'admin@hospital.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@hospital.com',
        password: adminPassword,
        role: 'admin',
        phone: '+91-98765-00100'
      });
      console.log('✅ Admin Created: admin@hospital.com (Pass: Admin@123)');
    } else {
      console.log('ℹ️ Admin already exists: admin@hospital.com');
    }

    // 2. Create Receptionist if not exists
    let recepUser = await User.findOne({ email: 'receptionist@hospital.com' });
    if (!recepUser) {
      recepUser = await User.create({
        name: 'Sarah Receptionist',
        email: 'receptionist@hospital.com',
        password: recepPassword,
        role: 'receptionist',
        phone: '+91-98765-00101'
      });
      console.log('✅ Receptionist Created: receptionist@hospital.com (Pass: Recep@123)');
    } else {
      console.log('ℹ️ Receptionist already exists: receptionist@hospital.com');
    }

    // 3. Create Sample Patient & Senior Citizen Patient if not exist
    let patientUser = await User.findOne({ email: 'patient@hospital.com' });
    if (!patientUser) {
      patientUser = await User.create({
        name: 'John Patient',
        email: 'patient@hospital.com',
        password: defaultPassword,
        role: 'patient',
        phone: '+91-98765-00199',
        isSeniorCitizen: false
      });
      console.log('✅ Patient Created: patient@hospital.com (Pass: Password123)');
    }

    let seniorPatient = await User.findOne({ email: 'senior@hospital.com' });
    if (!seniorPatient) {
      seniorPatient = await User.create({
        name: 'Robert Senior',
        email: 'senior@hospital.com',
        password: defaultPassword,
        role: 'patient',
        phone: '+91-98765-00188',
        isSeniorCitizen: true
      });
      console.log('✅ Senior Patient Created: senior@hospital.com (Pass: Password123)');
    }

    // 4. Seed Doctors per Department
    const doctorList = [
      { name: 'Dr. Sharma', email: 'sharma@hospital.com', department: 'General Medicine', spec: 'Internal Medicine', fee: 500 },
      { name: 'Dr. Verma', email: 'verma@hospital.com', department: 'General Medicine', spec: 'Family Medicine', fee: 550 },
      { name: 'Dr. Mehta', email: 'mehta@hospital.com', department: 'Cardiology', spec: 'Interventional Cardiology', fee: 1000 },
      { name: 'Dr. Rao', email: 'rao@hospital.com', department: 'Cardiology', spec: 'Electrophysiology', fee: 1100 },
      { name: 'Dr. Iyer', email: 'iyer@hospital.com', department: 'Orthopedics', spec: 'Joint Replacement & Trauma', fee: 850 },
      { name: 'Dr. Nair', email: 'nair@hospital.com', department: 'Pediatrics', spec: 'Pediatric Care', fee: 600 },
      { name: 'Dr. Kapoor', email: 'kapoor@hospital.com', department: 'Dermatology', spec: 'Cosmetic & Clinical Derma', fee: 750 },
      { name: 'Dr. Bose', email: 'bose@hospital.com', department: 'ENT', spec: 'Ear Nose Throat Specialist', fee: 650 }
    ];

    const datesToSeed = [];
    const today = new Date();
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const d = new Date(today);
      d.setDate(d.getDate() + dayOffset);
      datesToSeed.push(d.toISOString().split('T')[0]);
    }

    // for (const docData of doctorList) {
    //   let docUser = await User.findOne({ email: docData.email });
    //   if (!docUser) {
    //     docUser = await User.create({
    //       name: docData.name,
    //       email: docData.email,
    //       password: defaultPassword,
    //       role: 'doctor',
    //       phone: '+91-98765-00177'
    //     });

    //     const slots = [];
    //     for (const dStr of datesToSeed) {
    //       const startHours = [9, 10, 11, 14, 15, 16];
    //       for (const hour of startHours) {
    //         slots.push({
    //           date: dStr,
    //           startTime: `${hour.toString().padStart(2, '0')}:00`,
    //           endTime: `${hour.toString().padStart(2, '0')}:30`,
    //           isBooked: false
    //         });
    //         slots.push({
    //           date: dStr,
    //           startTime: `${hour.toString().padStart(2, '0')}:30`,
    //           endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
    //           isBooked: false
    //         });
    //       }
    //     }

    //     await Doctor.create({
    //       user: docUser._id,
    //       department: docData.department,
    //       specialization: docData.spec,
    //       qualification: 'MBBS, MD (Gold Medalist)',
    //       consultationFee: docData.fee,
    //       availableSlots: slots,
    //       onLeave: false
    //     });

    //     console.log(`👨‍⚕️ Seeded Doctor: ${docData.name} (${docData.department})`);
    //   } else {
    //     console.log(`ℹ️ Doctor already exists: ${docData.name}`);
    //   }
    // }
  for (const docData of doctorList) {
  let docUser = await User.findOne({ email: docData.email });

  // Create the doctor account only if it does not exist.
  if (!docUser) {
    docUser = await User.create({
      name: docData.name,
      email: docData.email,
      password: defaultPassword,
      role: 'doctor',
      phone: '+91-98765-00177'
    });

    console.log(`Created doctor user: ${docData.email}`);
  }

  // Ensure the existing account has the correct role.
  if (docUser.role !== 'doctor') {
    console.warn(
      `Skipping ${docData.email}: existing account is not a doctor.`
    );
    continue;
  }

  // Check for a Doctor profile independently of the User account.
  let doctorProfile = await Doctor.findOne({ user: docUser._id });

  if (!doctorProfile) {
    const slots = [];

    for (const dStr of datesToSeed) {
      const startHours = [9, 10, 11, 14, 15, 16];

      for (const hour of startHours) {
        slots.push({
          date: dStr,
          startTime: `${String(hour).padStart(2, '0')}:00`,
          endTime: `${String(hour).padStart(2, '0')}:30`,
          isBooked: false
        });

        slots.push({
          date: dStr,
          startTime: `${String(hour).padStart(2, '0')}:30`,
          endTime: `${String(hour + 1).padStart(2, '0')}:00`,
          isBooked: false
        });
      }
    }

    doctorProfile = await Doctor.create({
      user: docUser._id,
      department: docData.department,
      specialization: docData.spec,
      qualification: 'MBBS, MD (Gold Medalist)',
      consultationFee: docData.fee,
      availableSlots: slots,
      onLeave: false
    });

    console.log(`Created Doctor profile: ${docData.name}`);
  } else {
    console.log(`Doctor profile already exists: ${docData.name}`);
  }
}

    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    console.log(`\n🎉 Seed check complete! Current database totals:`);
    console.log(`   • Total Users: ${totalUsers}`);
    console.log(`   • Total Patients: ${totalPatients} (Registered patients preserved)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedData();
