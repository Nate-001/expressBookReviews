const express = require('express');
const app = express();

app.use(express.json());
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if (userswithsamename.length > 0){
        return true;
    } else {
        return false;
    }
}


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log('Received data:', req.body);

    if (username && password){
        if(!doesExist(username)){
            users.push({"username":username,"password":password});
            return res.status(200).json({message: "User successfully registerd. Now you can login"});
        }else{
            return res.status(404).json({message: "User already exists!"});
    }
}
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
let getBookList = new Promise((resolve, reject) => {
        // Simulate some asynchronous operation, e.g., fetching books
        setTimeout(() => {
            // Assuming 'books' is the data you want to send
            const bookList = JSON.stringify(books, null, 4);
            resolve(bookList);
        }, 1000); // Simulating a delay of 1 second
    });

    getBookList.then((bookList) => {
        console.log(bookList)
    })



// Get book details based on ISBN
let getNewBookDetails = (isbn) => new Promise((resolve, reject) => {
        // Simulate some asynchronous operation, e.g., fetching book details
        setTimeout(() => {
            const bookDetails = books[isbn];
            if (bookDetails) {
                resolve(bookDetails);
            } else {
                reject(`Book with ISBN ${isbn} not found`);
            }
        }, 1000); // Simulating a delay of 1 second
    });
    
     let isbn = 1;
    getNewBookDetails(isbn).then((bookDetails) => {
        console.log(bookDetails)
    })

  
// Get book details based on author
let getBooksByAuthor = (author) => new Promise((resolve, reject) => {
    setTimeout(() => {
    let keys = Object.keys(books);
    let authorRequested = author;

    // Use Object.keys to iterate through the keys of the object
    let authorsBooks = keys.filter((key) => books[key].author === authorRequested).map((key) => books[key]); // Map the keys back to book details

    if (authorsBooks.length > 0) {
        resolve(authorsBooks);
    } else {
        reject({ message: "Author not found in the book collection" });
    }
    }, 1000);
});

    let author = "Unknown";
    getBooksByAuthor(author).then((authorsBooks) => {
        console.log(authorsBooks)
    })



// Get all books based on title
  let getBooksByTitle = (title) => new Promise((resolve, reject) => {
    setTimeout(() => {
    let keys = Object.keys(books);
    let titleRequested = title;

    // Use Object.keys to iterate through the keys of the object
    let bookTitles = keys.filter((key) => books[key].title === titleRequested).map((key) => books[key]); // Map the keys back to book details

    if (bookTitles.length > 0) {
        resolve(bookTitles);
    } else {
        reject({ message: "Book title not found in the book collection" });
    }
    }, 1000);
});  
  
let title = "Fairy tales";
getBooksByTitle(title).then((bookTitles) => {
        console.log(bookTitles)
    })

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews)
});

module.exports.general = public_users;
