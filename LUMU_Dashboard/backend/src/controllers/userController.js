const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role, phone, department } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'viewer',
            phone,
            department
        });

        // Don't return password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ success: true, message: 'User created successfully', user: userResponse });
    } catch (error) {
        console.error('Create User Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, phone, department, active, avatar } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (phone !== undefined) user.phone = phone;
        if (department !== undefined) user.department = department;
        if (typeof active === 'boolean') user.active = active;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({ success: true, message: 'User updated successfully', user: userResponse });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.params.id).select('+password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If admin is changing password, currentPassword might not be required
        if (currentPassword) {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update Password Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Login (basic auth)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.active) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({ success: true, user: userResponse });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: error.message });
    }
};
