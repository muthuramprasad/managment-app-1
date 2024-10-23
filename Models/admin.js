import mongoose from 'mongoose';

const newUserSchema = new mongoose.Schema({
    adminInfo: [{
        name: {
            type: String,
            required: true,
    
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
        },
        googleId: {
            type: String,
            required: false,
        },
        id: {
            type: String,
        },
    }],
    isDeleted:{
type:Boolean,
default: false,
    },
}, { timestamps: true }); // Apply timestamps at the schema level

// Combined pre-save middleware to process both name and password
newUserSchema.pre('save', function(next) {
    this.adminInfo.forEach(info => {
        if (info.name) {
            info.name = info.name.toLowerCase(); // Convert name to lowercase
        }
        if (info.password) {
            info.password = info.password.trim(); // Trim whitespace from password
        }
    });
    next(); // Proceed to the next middleware or save
});

// Create a method to perform a soft delete
newUserSchema.methods.softDelete = function() {
    this.isDeleted = true;
    return this.save(); // Save the changes to the database
};


// Create the Admin model
const Admin = mongoose.model('Admin', newUserSchema);
export default Admin;
