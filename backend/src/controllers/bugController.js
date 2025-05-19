const Bug = require('../models/Bug');

// Create a new bug
exports.createBug = async (req, res) => {
    try {
        const bug = new Bug({
            ...req.body,
            createdBy: req.user._id
        });
        await bug.save();
        res.status(201).json(bug);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all bugs with optional filtering
exports.getBugs = async (req, res) => {
    try {
        const { status, priority, assignedTo } = req.query;
        const query = {};
        
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;

        const bugs = await Bug.find(query)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
            
        res.json(bugs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single bug by ID
exports.getBugById = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');
            
        if (!bug) {
            return res.status(404).json({ message: 'Bug not found' });
        }
        
        res.json(bug);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a bug
exports.updateBug = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        
        if (!bug) {
            return res.status(404).json({ message: 'Bug not found' });
        }

        // Check if user is authorized to update
        if (bug.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this bug' });
        }

        Object.assign(bug, req.body);
        await bug.save();
        
        res.json(bug);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a bug
exports.deleteBug = async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        
        if (!bug) {
            return res.status(404).json({ message: 'Bug not found' });
        }

        // Check if user is authorized to delete
        if (bug.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this bug' });
        }

        await Bug.deleteOne({ _id: req.params.id });
        res.json({ message: 'Bug deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 