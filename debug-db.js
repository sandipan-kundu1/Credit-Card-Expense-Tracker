const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Import models
const User = require('./backend/models/User');
const CreditCard = require('./backend/models/CreditCard');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creditcard_tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Check users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user._id}`);
    });
    
    // Check credit cards
    const cards = await CreditCard.find({});
    console.log(`\n💳 Found ${cards.length} credit cards:`);
    cards.forEach(card => {
      console.log(`- ${card.cardName} (${card.cardType}) - User: ${card.userId} - Active: ${card.isActive}`);
    });
    
    // Check for Sandipan Kundu specifically
    const sandipanUser = await User.findOne({ name: /sandipan kundu/i });
    if (sandipanUser) {
      console.log(`\n🔍 Found Sandipan Kundu: ${sandipanUser._id}`);
      const sandipanCards = await CreditCard.find({ userId: sandipanUser._id });
      console.log(`💳 Sandipan's cards: ${sandipanCards.length}`);
      sandipanCards.forEach(card => {
        console.log(`  - ${card.cardName} (${card.cardType}) - Active: ${card.isActive}`);
      });
    } else {
      console.log('\n❌ Sandipan Kundu user not found');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkDatabase();