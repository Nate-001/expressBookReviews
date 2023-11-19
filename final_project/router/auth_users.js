const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user) =>{
        return user.username === username 
    });
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
        return res.status(404).json({message: "Error logging in"});
    }
    if(authenticatedUser(username,password)){
        let accessToken = jwt.sign({
            data: password
        }, 'access', {expiresIn: 60 * 60});
    
        req.session.authorization = {
            accessToken,username 
        }
    return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Function to check if the user already has a review for a given ISBN
const hasReview = (isbn, username) => {
    const book = books[isbn];
    
    if (book && book.reviews.hasOwnProperty(username)) {
        return true;
    }
    
    return false;
};

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    console.log("Received PUT request for /auth/review/:isbn");
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Assuming you store the username in the session

    // Check if the book with the given ISBN exists
    let book = books[isbn];
    if (book) {
        // Check if the user already has a review for this ISBN
        const userHasReview = hasReview(isbn, username);

        // Get the review from the request query
        const newReview = req.query.review;

        if (!userHasReview) {
            // If the user does not have a review, add a new review
            if (!book.reviews) {
                book.reviews = {};
            }

            // Assign the new review to the corresponding username
            book.reviews[username] = newReview;

            return res.status(201).send("New review has been posted.");
        } else {
            // If the user already has a review, modify the existing review
            book.reviews[username] = newReview;

            return res.status(200).send("User review successfully modified.");
        }
    }

    return res.status(404).send("Cannot post review. Book not found.");
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    let book = books[isbn];
    
    if (book && book.reviews) {
        // Check if the user has a review for this book
        if (book.reviews.hasOwnProperty(username)) {
            // If yes, delete the user's review
            delete book.reviews[username];
            res.send(`${username}'s review for book ${isbn} has been deleted.`);
        } else {
            res.status(404).send(`${username} does not have a review for book ${isbn}.`);
        }
    } else {
        res.status(404).send(`Book with ISBN ${isbn} not found.`);
    }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;