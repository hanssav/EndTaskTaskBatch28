const http = require("http");
const exspress = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");

const { dirname } = require("path");
const hbs = require("hbs");

// create variable for exspress
const app = exspress();

// use app exspress
app.use(exspress.json());

// set view enggine
app.set("view engine", "hbs");

// sett koneksi
const dbConnection = require('./connection/db');
const { query } = require("./connection/db");

// register path folder public
app.use("/public", exspress.static(path.join(__dirname, "public")));

// register view partials
hbs.registerPartials(path.join(__dirname, "views/partials"));

// html form parser
app.use(exspress.urlencoded({ extended: false }));

// user session
app.use(
  session({
    cookie: {
      maxAge: 2 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
    store: new session.MemoryStore(),
    saveUninitialized: false,
    resave: false,
    secret: "secretValue",
  })
);

// use flash for sending message
app.use(flash());

// setup flash message
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.get("/", function (req, res) {
  const query = `SELECT  a.id, a.name, b.name AS collection_name, b.id AS id_collection FROM task_tb a INNER JOIN collection_tb b ON a.collection_id = b.id`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      // console.log(results)

      let tasks = [];

      for (result of results) {
        tasks.push({
          ...result,
        });
      }

      if (tasks.length == 0) {
        tasks = false;
      }
      if (!req.session.user) {
        res.render("auth/login", {
          title: "Todo List",
          isLogin: req.session.isLogin,
          tasks,
        });
      } else {
        res.render("index", {
          title: "Todo List",
          isLogin: req.session.isLogin,
          tasks,
        });
      }
    });

    conn.release();
  });
});

app.get("/login", function (req, res) {
  res.render("auth/login", {
    title: "Login",
    isLogin: req.session.isLogin,
  })
});

app.post("/login", function (req, res) {
  const { email, password } = req.body;

  if (email == "" || password == "") {
    req.session.message = {
      type: "danger",
      message: "Please full fill input",
    };
    return res.redirect("/login");
  }

  const query = `SELECT id, email, MD5(password), username FROM tb_user WHERE email = '${email}' AND password = '${password}';`

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [email], (err, results) => {
      if (err) throw err;

      if (results.length == 0) {
        req.session.message = {
          type: "danger",
          message: "Oupss!! Email or Password Not Found or Incorect",
        };
        return res.redirect("/login");
      } else {
        req.session.message = {
          type: "success",
          message: "Yeeyy!! Login successfully",
        };

        req.session.isLogin = true;

        req.session.user = {
          id: results[0].id,
          name: results[0].email,
          email: results[0].password,
        };

        console.log(results);
        return res.redirect("/");
      }
    });
    conn.release();
  });
});

app.get("/register", function (req, res) {
  res.render("auth/register", {
    title: "Register",
    isLogin: req.session.isLogin,
  })
});

app.post("/register", function (req, res) {
  const { email, password, name } = req.body;

  if (email == "" || password == "" || name == "") {
    req.session.message = {
      type: "danger",
      message: "Please full fill input",
    };
    return res.redirect("/register");
  }

  const query = `INSERT INTO tb_user (email, password, username) VALUES ('${email}', '${password}', '${name}')`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      req.session.message = {
        type: "success",
        message: "Yeeyy!! Register Account successfully",
      };

      res.redirect("/register");
    });
    conn.release();
  });
});

// logout
app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

app.get("/add-collection", function (req, res) {
  res.render("task/add-collection", {
    title: "Add Collection",
    isLogin: req.session.isLogin,
  })
});

app.post("/add-collection", function (req, res) {
  const { name } = req.body;

  if (name == '') {
    req.session.message = {
      type: 'danger',
      message: 'Please input collection name'
    }
    return res.redirect('/add-collection')
  }

  const query = `INSERT INTO collection_tb (name, user_id) VALUES ("${name}", "${req.session.user.id}")`

  dbConnection.getConnection(function (err, conn) {
    if (err) throw err;

    conn.query(query, (err, results) => {


      console.log(err)
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Uopss!!!, Somethink Wrong, please input again!",
        };
        return res.redirect("/add-collection");

      } else {
        req.session.message = {
          type: "success",
          message: "Yeeyy!! Add Collection successfully",
        };
        res.redirect("/add-collection");
        }
      })
    conn.release();
  })
})

app.post("/add-task", function (req, res) {

  const { name, id_collection } = req.body;

  // console.log(id_collection)
  if (name == '') {
    req.session.message = {
      type: 'danger',
      message: 'Please Input Task Name'
    }
    return res.redirect('/')
  }

  const query = `INSERT INTO task_tb (name, is_done, collection_id) VALUES ("${name}", FALSE, "${id_collection}" )`

  dbConnection.getConnection(function (err, conn) {
    if (err) throw err;

    console.log(err)

    conn.query(query, (err, results) => {
      console.log(err)
      if (err) {
        req.session.message = {
          type: "danger",
          message: "Uopss!!!, Somethink Wrong, please input again!",
        };
        return res.redirect("/");

      } else {
        req.session.message = {
          type: "success",
          message: "Yeeyy!! Add Task successfully",
        };
        res.redirect("/");
        }
    })
    conn.release();
  })
})

app.get("/edit-task/:id", function (req, res) {
  const query = `SELECT  a.id, a.name, b.name AS collection_name, b.id AS id_collection FROM task_tb a INNER JOIN collection_tb b ON a.collection_id = b.id`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      let tasks = [];

      for (result of results) {
        tasks.push({
          ...result,
        });
      }

      const task = {
        ...results[0],
      }

      if (tasks.length == 0) {
        tasks = false;
      }

      res.render("task/edit-task", {
        title: "Edit Task",
        isLogin: req.session.isLogin,
        tasks,
        task
      });
    });

    conn.release();
  });
})

app.post("/edit-task/:id", function (req, res) {
  let { id, name, id_collection } = req.body;

  const query = `UPDATE task_tb SET name = "${name}", collection_id = "${id_collection}" WHERE id = ${id}`;

  dbConnection.getConnection((err, conn) => {
    // if (err) throw err;
    if (err) {
      console.log(err);
    }

    conn.query(query, (err, results) => {
      // if (err) throw err;

      if (err) {
        console.log(err);
      }
      res.redirect("/");
      // res.redirect(`car/car-detail/${results.insertId}`);
    });

    conn.release();
  });
})

app.get("/collection", function (req, res) {
  const query = `SELECT * FROM collection_tb`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;



      let collections = [];

      for (result of results) {
        collections.push({
          ...result,
        });
      }

      if (collections.length == 0) {
        collections = false;
      }
      res.render("task/collection", {
      title: "List Collection",
        isLogin: req.session.isLogin,
      collections
      })
    });
    conn.release();
  });
});

app.get("/edit-collection/:id", function (req, res) {
  const { id } = req.params;
  const query = `SELECT * FROM collection_tb WHERE id = ${id}`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) throw err;

      const collection = {
        ...results[0],
      };
      res.render("task/edit-collection", {
        isLogin: req.session.isLogin,
        collection,
      });
    });
    conn.release();
  });
});

app.post("/edit-collection/:id", function (req, res) {
  let { id, name } = req.body;

  const query = `UPDATE collection_tb SET name = "${name}" WHERE id = ${id}`;

  dbConnection.getConnection((err, conn) => {
    // if (err) throw err;
    if (err) {
      console.log(err);
    }

    console.log(query)
    conn.query(query, (err, results) => {
      // if (err) throw err;
      if (err) {
        console.log(err);
      }
      res.redirect("/collection");
      // res.redirect(`car/car-detail/${results.insertId}`);
    });

    conn.release();
  });
})

app.post("/edit-task/:id", function (req, res) {
  let { id, name, id_collection } = req.body;

  const query = `UPDATE task_tb SET name = "${name}", collection_id = "${id_collection}" WHERE id = ${id}`;

  dbConnection.getConnection((err, conn) => {
    // if (err) throw err;
    if (err) {
      console.log(err);
    }

    conn.query(query, (err, results) => {
      // if (err) throw err;

      if (err) {
        console.log(err);
      }
      res.redirect("/");
      // res.redirect(`car/car-detail/${results.insertId}`);
    });

    conn.release();
  });
})

app.get("/delete-collection/:id", function (req, res) {
  const { id } = req.params;

  const query = `DELETE FROM collection_tb WHERE id = ${id}`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.sqlMessage,
        };
        res.redirect("/collection");
      } else {
        req.session.message = {
          type: "success",
          message: "Delete Collection susccessfully",
        };
        res.redirect("/collection");
      }
    });

    conn.release();
  });
});

app.get("/delete-task/:id", function (req, res) {
  const { id } = req.params;

  const query = `DELETE FROM task_tb WHERE id = ${id}`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, (err, results) => {
      if (err) {
        req.session.message = {
          type: "danger",
          message: err.sqlMessage,
        };
        res.redirect("/");
      } else {
        req.session.message = {
          type: "success",
          message: "Delete Task susccessfully",
        };
        res.redirect("/");
      }
    });

    conn.release();
  });
});

const port = 5000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`server running on port: ${port}`);
});