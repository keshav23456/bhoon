require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MongoDB URI not found. Please set MONGODB_URI in .env file');
      console.log('Server running without database connection.');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('Server running without database connection.');
  }
};

connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  balance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// Fix old schema issues - drop all problematic indexes
const fixOldIndexes = async () => {
  try {
    const indexes = await User.collection.getIndexes();
    const indexesToDrop = [];
    
    // Find all indexes except _id_ (which is required)
    for (const indexName in indexes) {
      if (indexName !== '_id_') {
        indexesToDrop.push(indexName);
      }
    }
    
    if (indexesToDrop.length > 0) {
      console.log('🔧 Dropping old indexes:', indexesToDrop.join(', '));
      for (const indexName of indexesToDrop) {
        await User.collection.dropIndex(indexName);
      }
      console.log('✅ All old indexes removed');
    } else {
      console.log('✓ No old indexes to clean up');
    }
  } catch (error) {
    // Collection doesn't exist yet or other error - that's fine
    console.log('✓ No old indexes to clean up');
  }
};

// Call fix when database is connected
if (mongoose.connection.readyState === 1) {
  fixOldIndexes();
} else {
  mongoose.connection.once('open', fixOldIndexes);
}

// API Routes

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search users by name
app.get('/api/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const users = await User.find({
      name: { $regex: q, $options: 'i' }
    }).sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new user
app.post('/api/users', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ name: name.trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ name: name.trim() });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user transactions
app.get('/api/users/:id/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.id })
      .sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all transactions for this user
    await Transaction.deleteMany({ userId: req.params.id });
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and all transactions deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add transaction (credit/debit)
app.post('/api/users/:id/transactions', async (req, res) => {
  try {
    const { type, amount, date, description } = req.body;
    
    if (!type || !amount || !date) {
      return res.status(400).json({ error: 'Type, amount, and date are required' });
    }

    if (!['credit', 'debit'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either credit or debit' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update balance
    if (type === 'credit') {
      user.balance += parsedAmount;
    } else {
      user.balance -= parsedAmount;
    }

    // Create transaction
    const transaction = new Transaction({
      userId: user._id,
      userName: user.name,
      type,
      amount: parsedAmount,
      date: new Date(date),
      description: description || '',
      balanceAfter: user.balance
    });

    await user.save();
    await transaction.save();

    res.status(201).json({ user, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;

