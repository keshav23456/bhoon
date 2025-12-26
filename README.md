# 📊 Dukan Ledger

A mobile-optimized ledger application for tracking user balances with credit/debit transactions. Perfect for small shops, personal lending, or any business that needs to track customer accounts.

## ✨ Features

- 📱 **Mobile-Optimized**: Fully responsive design that works great on phones
- 👤 **User Management**: Add and search users easily
- 💰 **Balance Tracking**: Track credit and debit transactions for each user
- 📅 **Date-wise Transactions**: Record transactions with specific dates (auto-fills today's date)
- 📊 **Transaction History**: View complete transaction history for each user
- 🔍 **Quick Search**: Real-time search to find users instantly
- 💾 **MongoDB Database**: All data persisted in MongoDB

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB account (MongoDB Atlas free tier works great)
- npm or yarn

### Installation

1. **Install Dependencies**

```bash
npm install
```

2. **Setup Environment Variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your MongoDB connection string:

```
MONGODB_URI=your_mongodb_connection_string_here
PORT=3000
```

**Getting MongoDB Connection String:**
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster (if you haven't already)
- Click "Connect" → "Connect your application"
- Copy the connection string
- Replace `<password>` with your database user password
- Replace `myFirstDatabase` with your database name (e.g., `dukanLedger`)

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dukanLedger?retryWrites=true&w=majority
```

3. **Start the Server**

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

4. **Open in Browser**

Visit: `http://localhost:3000`

**For Mobile Testing:**
- Find your computer's local IP address (e.g., `192.168.1.100`)
- Make sure your phone is on the same WiFi network
- Open `http://YOUR_IP:3000` on your phone

## 📱 How to Use

### Adding a User

1. Enter the user's name in the "Add New User" section
2. Click "Add User"
3. User will be added to the database with a starting balance of ₹0

### Searching for a User

1. Type in the search box
2. Results will appear in real-time
3. Click on any user to view their details

### Managing Transactions

1. Select a user from search results
2. In the user detail page:
   - Date field is auto-filled with today's date (can be changed)
   - Enter the transaction amount
   - Add an optional description
   - Click "Credit" to add money (increases balance)
   - Click "Debit" to subtract money (decreases balance)
3. All transactions are saved with:
   - Date
   - Amount
   - Type (Credit/Debit)
   - Description
   - Balance after transaction

### Viewing Transaction History

- Transaction history is displayed below the transaction form
- Shows all transactions in reverse chronological order (newest first)
- Each transaction shows:
  - Type (Credit/Debit) with color coding
  - Amount
  - Date
  - Description (if provided)
  - Balance after that transaction

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Design**: Mobile-first responsive design

## 📂 Project Structure

```
dukan/
├── public/              # Frontend files
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styling
│   └── app.js          # Frontend JavaScript
├── server.js           # Backend server
├── package.json        # Dependencies
├── .env                # Environment variables (create this)
├── .env.example        # Environment template
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for your MongoDB database
- For production, add proper authentication and authorization
- Enable HTTPS in production environments

## 🐛 Troubleshooting

**MongoDB Connection Failed:**
- Check if your MongoDB URI is correct in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas (or allow access from anywhere)
- Verify your database user credentials

**Port Already in Use:**
- Change the PORT in `.env` file to a different number (e.g., 3001)

**Page Not Loading:**
- Check if the server is running
- Check the console for any error messages
- Ensure no firewall is blocking the connection

## 📝 API Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/search?q=query` - Search users by name
- `POST /api/users` - Add new user
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/transactions` - Get user transactions
- `POST /api/users/:id/transactions` - Add transaction

## 🎨 Customization

### Changing Currency Symbol

Edit `public/app.js` and `public/index.html` to replace `₹` with your preferred currency symbol.

### Changing Colors

Edit `public/styles.css` - All colors are defined in CSS variables at the top:

```css
:root {
    --primary-color: #4CAF50;
    --danger-color: #f44336;
    --success-color: #4CAF50;
    /* ... */
}
```

## 📄 License

ISC

## 🤝 Support

For issues or questions, please check:
1. MongoDB connection is working
2. All dependencies are installed
3. `.env` file is properly configured
4. Server is running without errors

---

Made with ❤️ for small businesses

# bhoon
