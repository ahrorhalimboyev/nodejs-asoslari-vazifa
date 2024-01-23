const http = require("http");
const path = require("path");
const fs = require("fs");

const filePath = path.join(__dirname, "books.json");
const jsonData = `[{"id":1,"title":"Odam bo'lish qiyin","author":"O'tkir Hoshimov"},{"id":2,"title":"Sariq devni minib","author":"Xudoyberdi To'xtaboyev"}]`;

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, jsonData);
}

const server = http.createServer((req, res) => {
  const bookData = fs.readFileSync(path.join(__dirname, "books.json"), "utf8");
  const books = JSON.parse(bookData);
  const urlElements = req.url.split("/");
  const Id = parseInt(urlElements[urlElements.length - 1]);

  if (req.url === "/books" && req.method === "GET") {
    res.end(bookData);
  }
  if (
    typeof Id == "number" &&
    req.url === `/books/${Id}` &&
    req.method === "GET"
  ) {
    const book1 = books.filter((book) => book.id == Id);
    !book1.length > 0
      ? res.end(`<h1>Data with ID-${Id} not found</h1>`)
      : res.end(JSON.stringify(book1));
  }
  if (req.url === "/books/new") {
    res.end(`<html>
      <head><title>Books</title></head>
        <body>
          <form action="/books/add" method="POST">
            <label for="title">Book title</label>
            <input type="text" name="title"> <br>
            <label for="author">Book author</label>
            <input type="text" name="author"> <br>
            <button>Create</button>

          </form>
        </body>
      </html>`);
  }
  if (req.url === "/books/add" && req.method === "POST") {
    const body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", () => {
      const data = Buffer.concat(body).toString();
      const newBook = {
        id: (books[books.length - 1]?.id || 0) + 1,
        title: data
          .split("&")[0]
          .split("=")[1]
          .replace(/\+/g, " ")
          .replace(/\%27/g, "'"),
        author: data
          .split("&")[1]
          .split("=")[1]
          .replace(/\+/g, " ")
          .replace(/\%27/g, "'"),
      };

      const hasBook = books.filter((book) => book.title === newBook.title);
      if (hasBook.length > 0) {
        res.end(
          `<h1> Book with "${hasBook[0].title}" title already available</h1>`
        );
      } else {
        books.push(JSON.parse(JSON.stringify(newBook)));
        fs.writeFileSync("books.json", JSON.stringify(books));
        res.end(
          "<h1>Added successfully <br> </h1><a href='http://localhost:3003/books'>See the books</a>"
        );
      }
    });
  }
  if (req.url === `/books/edit/${Id}`) {
    const choosenBook = books.find((book) => book.id === Id);
    if (!choosenBook) {
      res.end(
        `<h1>Book with ID-${Id} not found</h1><a href='http://localhost:3003/books'>See the books</a>`
      );
    } else {
      res.end(`
        <html>
          <head><title>Edit Book</title></head>
          <body>
            <h1>Edit Book</h1>
            <form action="/books/update/${Id}" method="POST">
              <label for="title">Title</label>
              <input type="text" name="title" value="${choosenBook.title}"><br>
              <label for="author">Author</label>
              <input type="text" name="author" value="${choosenBook.author}"><br>
              <button type="submit">Update</button>
            </form>
          </body>
        </html>
      `);
    }
  }
  if (req.url === `/books/update/${Id}` && req.method === "POST") {
    const body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", () => {
      const data = Buffer.concat(body).toString();
      const updatedBooks = books.map((book) => {
        if (book.id == Id) {
          (book.title = data
            .split("&")[0]
            .split("=")[1]
            .replace(/\+/g, " ")
            .replace(/\%27/g, "'")),
            (book.author = data
              .split("&")[1]
              .split("=")[1]
              .replace(/\+/g, " ")
              .replace(/\%27/g, "'"));
        }
        return book;
      });
      const filePath = path.join(__dirname, "books.json");
      fs.writeFileSync(filePath, JSON.stringify(updatedBooks));
    });

    res.end(
      "<p>Updated successfully</p><br><a href='http://localhost:3003/books'>See the books</a>"
    );
  }
  if (req.url === `/books/delete/${Id}`) {
    if (books.find((book) => book.id == Id)) {
      const derivedBooks = books.filter((book) => book.id != Id);
      fs.writeFileSync(
        path.join(__dirname, "books.json"),
        JSON.stringify(derivedBooks)
      );
      res.end(
        "<p>Deleted successfully</p><br><a href='http://localhost:3003/books'>See the books</a>"
      );
    } else {
      res.end(
        `<p>Book with ID-${Id} not found</p><br><a href='http://localhost:3003/books'>See the books</a>`
      );
    }
  }
});

const PORT = process.env.PORT || 3003;

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
