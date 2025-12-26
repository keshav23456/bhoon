// API Base URL
const API_BASE = window.location.origin;

// State
let currentUser = null;

// DOM Elements
const addUserForm = document.getElementById('addUserForm');
const userNameInput = document.getElementById('userName');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const addUserSection = document.getElementById('addUserSection');
const userDetailsSection = document.getElementById('userDetailsSection');
const userDetailName = document.getElementById('userDetailName');
const userBalance = document.getElementById('userBalance');
const transactionForm = document.getElementById('transactionForm');
const transactionDate = document.getElementById('transactionDate');
const transactionAmount = document.getElementById('transactionAmount');
const transactionDescription = document.getElementById('transactionDescription');
const transactionList = document.getElementById('transactionList');
const backBtn = document.getElementById('backBtn');
const deleteUserBtn = document.getElementById('deleteUserBtn');
const toast = document.getElementById('toast');
const loadingSpinner = document.getElementById('loadingSpinner');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTodayDate();
    setupEventListeners();
    loadAllUsers(); // Load all users on page load
});

// Set today's date as default
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    transactionDate.value = today;
}

// Setup Event Listeners
function setupEventListeners() {
    addUserForm.addEventListener('submit', handleAddUser);
    searchInput.addEventListener('input', handleSearch);
    transactionForm.addEventListener('submit', handleTransaction);
    backBtn.addEventListener('click', showMainView);
    deleteUserBtn.addEventListener('click', handleDeleteUser);
}

// Show/Hide Loading
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Show Toast Notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Load All Users
async function loadAllUsers() {
    try {
        const response = await fetch(`${API_BASE}/api/users`);
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

// Display Users in Search Results
function displayUsers(users) {
    if (users.length === 0) {
        searchResults.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <p>No users found</p>
                <p style="font-size: 14px; margin-top: 5px;">Add a user to get started!</p>
            </div>
        `;
        return;
    }

    searchResults.innerHTML = users.map(user => {
        const balanceClass = user.balance >= 0 ? 'positive' : 'negative';
        const balanceSign = user.balance >= 0 ? '+' : '';
        return `
            <div class="search-result-item" data-user-id="${user._id}">
                <div class="search-result-info" data-user-id="${user._id}">
                    <span class="search-result-name">${user.name}</span>
                    <span class="search-result-balance ${balanceClass}">
                        ${balanceSign}₹${user.balance.toFixed(2)}
                    </span>
                </div>
                <button class="search-result-delete" data-user-id="${user._id}" data-user-name="${user.name}" title="Delete user">
                    🗑️
                </button>
            </div>
        `;
    }).join('');

    // Add click listeners to search results info (to view details)
    document.querySelectorAll('.search-result-info').forEach(item => {
        item.addEventListener('click', () => {
            const userId = item.dataset.userId;
            showUserDetails(userId);
        });
    });

    // Add click listeners to delete buttons
    document.querySelectorAll('.search-result-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening user details
            const userId = btn.dataset.userId;
            const userName = btn.dataset.userName;
            deleteUserFromList(userId, userName);
        });
    });
}

// Handle Add User
async function handleAddUser(e) {
    e.preventDefault();
    const name = userNameInput.value.trim();

    if (!name) {
        showToast('⚠️ Please enter a name', 'error');
        return;
    }

    showLoading();
    try {
        const response = await fetch(`${API_BASE}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error && data.error.includes('already exists')) {
                showToast(`❌ User "${name}" already exists!`, 'error');
            } else {
                throw new Error(data.error || 'Failed to add user');
            }
            return;
        }

        showToast(`✅ User "${name}" added successfully!`, 'success');
        userNameInput.value = '';
        
        // Refresh the user list to show the new user
        loadAllUsers();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle Search
let searchTimeout;
async function handleSearch(e) {
    const query = e.target.value.trim();

    // Clear previous timeout
    clearTimeout(searchTimeout);

    // If search is empty, show all users
    if (!query) {
        loadAllUsers();
        return;
    }

    // Debounce search - wait 200ms after user stops typing
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE}/api/users/search?q=${encodeURIComponent(query)}`);
            const users = await response.json();

            if (users.length === 0) {
                searchResults.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <p>No users found matching "${query}"</p>
                    </div>
                `;
                return;
            }

            displayUsers(users);
        } catch (error) {
            showToast('Search failed', 'error');
        }
    }, 200);
}

// Show User Details
async function showUserDetails(userId) {
    showLoading();
    try {
        const [userResponse, transactionsResponse] = await Promise.all([
            fetch(`${API_BASE}/api/users/${userId}`),
            fetch(`${API_BASE}/api/users/${userId}/transactions`)
        ]);

        if (!userResponse.ok) {
            throw new Error('Failed to load user details');
        }

        const user = await userResponse.json();
        const transactions = await transactionsResponse.json();

        currentUser = user;

        // Update UI
        userDetailName.textContent = user.name;
        updateBalanceDisplay(user.balance);
        renderTransactions(transactions);

        // Show user details section
        addUserSection.style.display = 'none';
        document.querySelector('.search-section').style.display = 'none';
        userDetailsSection.style.display = 'block';

        // Reset form
        transactionForm.reset();
        setTodayDate();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Update Balance Display
function updateBalanceDisplay(balance) {
    const sign = balance >= 0 ? '+' : '';
    userBalance.textContent = `${sign}₹${balance.toFixed(2)}`;
}

// Render Transactions
function renderTransactions(transactions) {
    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }

    transactionList.innerHTML = transactions.map(txn => {
        const date = new Date(txn.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        const sign = txn.type === 'credit' ? '+' : '-';
        
        return `
            <div class="transaction-item">
                <div class="transaction-header">
                    <span class="transaction-type ${txn.type}">${txn.type}</span>
                    <span class="transaction-amount ${txn.type}">${sign}₹${txn.amount.toFixed(2)}</span>
                </div>
                <div class="transaction-details">
                    <div class="transaction-date">📅 ${date}</div>
                    ${txn.description ? `<div class="transaction-description">💬 ${txn.description}</div>` : ''}
                    <div class="transaction-balance">Balance after: ₹${txn.balanceAfter.toFixed(2)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Handle Transaction
async function handleTransaction(e) {
    e.preventDefault();
    
    const clickedButton = e.submitter;
    const type = clickedButton.dataset.type;
    const amount = parseFloat(transactionAmount.value);
    const date = transactionDate.value;
    const description = transactionDescription.value.trim();

    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }

    if (!date) {
        showToast('Please select a date', 'error');
        return;
    }

    if (!currentUser) {
        showToast('No user selected', 'error');
        return;
    }

    showLoading();
    try {
        const response = await fetch(`${API_BASE}/api/users/${currentUser._id}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, amount, date, description })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to add transaction');
        }

        showToast(`Transaction added: ${type} ₹${amount.toFixed(2)}`, 'success');

        // Update current user balance
        currentUser.balance = data.user.balance;
        updateBalanceDisplay(currentUser.balance);

        // Refresh transactions
        const transactionsResponse = await fetch(`${API_BASE}/api/users/${currentUser._id}/transactions`);
        const transactions = await transactionsResponse.json();
        renderTransactions(transactions);

        // Reset form
        transactionForm.reset();
        setTodayDate();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Delete User (common function)
async function deleteUser(userId, userName) {
    // Show confirmation dialog
    const confirmed = confirm(
        `⚠️ Are you sure you want to delete "${userName}"?\n\n` +
        `This will permanently delete:\n` +
        `- The user account\n` +
        `- All transaction history\n\n` +
        `This action cannot be undone!`
    );

    if (!confirmed) {
        return false;
    }

    showLoading();
    try {
        const response = await fetch(`${API_BASE}/api/users/${userId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete user');
        }

        showToast(`✅ User "${userName}" deleted successfully!`, 'success');
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    } finally {
        hideLoading();
    }
}

// Handle Delete User from Details Page
async function handleDeleteUser() {
    if (!currentUser) {
        showToast('No user selected', 'error');
        return;
    }

    const deleted = await deleteUser(currentUser._id, currentUser.name);
    if (deleted) {
        // Go back to main view
        showMainView();
    }
}

// Delete User from List
async function deleteUserFromList(userId, userName) {
    const deleted = await deleteUser(userId, userName);
    if (deleted) {
        // Refresh the user list
        loadAllUsers();
    }
}

// Show Main View
function showMainView() {
    currentUser = null;
    userDetailsSection.style.display = 'none';
    addUserSection.style.display = 'block';
    document.querySelector('.search-section').style.display = 'block';
    
    // Clear search and reload all users
    searchInput.value = '';
    loadAllUsers();
}

