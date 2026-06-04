require('dotenv').config()
const mongoose = require('mongoose')
const Admin = require('../models/Admin')

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI)
  
  const existing = await Admin.findOne({ 
    email: process.env.ADMIN_EMAIL 
  })
  
  if (existing) {
    console.log('Admin already exists:', existing.email)
    process.exit(0)
  }

  const admin = new Admin({
    name: 'Loopozone Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
  })

  await admin.save()
  console.log('Admin created successfully:', admin.email)
  console.log('Password is hashed. Login with:', process.env.ADMIN_PASSWORD)
  process.exit(0)
}

seedAdmin().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
