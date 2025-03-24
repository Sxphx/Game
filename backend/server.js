const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const passwordHash = require("password-hash");
const session = require("express-session");
const { log } = require("console");
const app = express();
const port = 3000;
app.use(express.static("public"));

app.use(
  cors({
    origin: ["http://127.0.0.1", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "a7f4e9c2b1d8e3a6f5c2d9b7e4a1f8c3",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(bodyParser.json());

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ctm",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

app.get("/allleaderboard", async (req, res) => {
  try {
    con.query(
      "SELECT username, score FROM scoreuser ORDER BY score DESC",
      function (err, result) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error" });
        }
        return res.status(200).json(result);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    con.query(
      "SELECT username, score FROM scoreuser ORDER BY score DESC LIMIT 3",
      function (err, result) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error" });
        }
        return res.status(200).json(result);
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.post("/register", (req, res) => {
  console.log("register endpoint hit");
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  const checkUserSql = "SELECT * FROM scoreuser WHERE username = ?";
  con.query(checkUserSql, [username], function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = passwordHash.generate(password);

    const insertUserSql =
      "INSERT INTO scoreuser (username, password) VALUES (?, ?)";
    con.query(
      insertUserSql,
      [username, hashedPassword],
      function (err, result) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Failed to register user" });
        }

        return res
          .status(201)
          .json({ message: "User registered successfully" });
      }
    );
  });
});

app.post("/logout", (req, res) => {
  if (req.session.user && req.session.user.loggedIn) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      return res.status(200).json({ message: "Logout successful" });
    });
  } else {
    return res.status(200).json({ message: "No user to logout" });
  }
});

app.post("/login", (req, res) => {
  console.log("login endpoint hit");
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  const checkUserSql = "SELECT * FROM scoreuser WHERE username = ?";
  con.query(checkUserSql, [username], function (err, result) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result[0];
    const hashedPassword = user.password;
    const passwordValid = passwordHash.verify(password, hashedPassword);

    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    req.session.user = {
      loggedIn: true,
      UID: user.user_id,
      username: user.username,
      score: user.score,
    };

    res.cookie("sessionID", req.sessionID, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        loggedIn: true,
        UID: user.user_id,
        username: user.username,
        score: user.score,
      },
    });
  });
});

app.post("/score", (req, res) => {
  if (req.session.user && req.session.user.loggedIn) {
    const { score } = req.body;
    const updateScoreSql = "UPDATE scoreuser SET score = ? WHERE user_id = ?";
    con.query(
      updateScoreSql,
      [score, req.session.user.UID],
      function (err, result) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error" });
        }
        return res.status(200).json({ message: "Score updated successfully" });
      }
    );
  } else {
    return res.status(401).json({ message: "Not logged in" });
  }
});

app.get("/session", (req, res) => {
  if (req.session.user && req.session.user.loggedIn) {
    return res.status(200).json({
      loggedIn: true,
      user: req.session.user,
    });
  }
  return res.status(200).json({ loggedIn: false });
});

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./Game" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying port ${port + 1}`);
      server.close();
      app.listen(port + 1, () => {
        console.log(`Server running at http://localhost:${port + 1}`);
      });
    } else {
      console.error(err);
    }
  });