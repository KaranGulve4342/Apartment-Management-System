const express = require("express");
const bodyParser = require("body-parser");
const db = require("./mysql_connect");
const dashB = require("./routes/dashb");
const cors = require("cors");

//port number to listen
const port = 4000;

//init
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/dashboard", dashB);
app.use(cors());

//initializing
app.listen(port, () => {
  console.log(`Server starten to listen...${port}`);
});

//home page
app.get("/", function (req, res) {
  res.send("Only accepting GET and POST requests!");
});

//authorisation
app.post("/auth", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  let rep = "unknown";
  let acces = "denied";

  if (
    username &&
    username.toUpperCase().charAt(0) === "E" &&
    password &&
    password.length >= 6
  ) {
    rep = "employee";

    // res.send({ user: "employee" });
  } else if (
    username &&
    username.toUpperCase().charAt(0) === "A" &&
    password &&
    password.length >= 6
  ) {
    rep = "admin";
  } else if (
    username &&
    username.toUpperCase().charAt(0) === "T" &&
    password &&
    password.length >= 6
  ) {
    rep = "tenant";
  } else if (
    username &&
    username.toUpperCase().charAt(0) === "O" &&
    password &&
    password.length >= 6
  ) {
    rep = "owner";
  }

  const resul = db.authoriseuser(username, password, (err, result) => {
    if (err) console.log(err);
    acces = result;
    console.log(acces);
    res.send({
      access: acces,
      user: rep,
    });
  });
});

//register complaint
app.post("/raisingcomplaint", function (req, res) {
  const desc = req.body.descp;
  const blockno = req.body.blockno;
  const roomno = req.body.roomno;
  const values = [desc, blockno, roomno];
  const resul = db.registercomplaint(values, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(401);
      return;
    } else res.send(result);
  });
});

//create a new tenant by owner
// app.post("/createtenant", function (req, res) {
//   const name = req.body.name;
//   const age = req.body.age;
//   const tenantno = req.body.tenantno;
//   const adhaar = req.body.adhaar;
//   const roomno = req.body.roomno;
//   const password = req.body.password;
//   const dob = req.body.dob;
//   const values = [tenantno, name, dob, roomno, age];
//   const resul = db.createtenant(values, (err, result) => {
//     if (err) console.log(err);
//     const prof = [adhaar, tenantno];
//     const vals = ["t-" + tenantno, password, tenantno];
//     const resul = db.createtenantproof(prof, (err, result) => {
//       if (err) {
//         console.log(err);
//         res.sendStatus(401);
//         return;
//       }
//     });
//     const respn = db.createuserid(vals, (err, result) => {
//       if (err) {
//         console.log(err);
//         res.sendStatus(401);
//         return;
//       } //res.sendStatus(404);
//       else res.sendStatus(200);
//     });
//   });
// });

app.post("/createtenant", function (req, res) {
  const name = req.body.name;
  const age = req.body.age;
  const tenantno = req.body.tenantno;
  const adhaar = req.body.adhaar;
  const roomno = req.body.roomno;
  const password = req.body.password;
  const dob = req.body.dob;
  
  // Check if any required field is missing
  if (!name || !age || !tenantno || !adhaar || !roomno || !password || !dob) {
    return res.status(400).json({ error: "Please provide all required fields." });
  }

  const values = [tenantno, name, dob, roomno, age];
  const resul = db.createtenant(values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "An error occurred while creating the tenant." });
    }

    const prof = [adhaar, tenantno];
    const vals = ["t-" + tenantno, password, tenantno];
    const resul = db.createtenantproof(prof, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "An error occurred while creating the tenant proof." });
      }
    });

    const respn = db.createuserid(vals, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "An error occurred while creating the user ID." });
      }

      res.sendStatus(200);
    });
  });
});


//creates owner in owner table
// app.post("/createowner", (req, res) => {
//   const ownerid = req.body.ownerId;
//   const name = req.body.name;
//   const age = req.body.age;
//   const aggrement_status = req.body.aggrementStatus;
//   const roomno = req.body.roomno;
//   const dob = req.body.dob;
//   const proof = req.body.adhaar;
//   const values = [ownerid, name, age, aggrement_status, roomno, dob];
//   const proofval = [proof, ownerid];
//   const password = req.body.password;
//   const vals = ["o-" + ownerid, password, ownerid];

//   const rest = db.createowner(values, (err, result) => {
//     if (err) {
//       console.log(err);
//       res.sendStatus(401);
//       return;
//     }
//   });
//   const rep = db.createownerproof(proofval, (err, result) => {
//     console.log(proofval);
//     if (err) {
//       console.log(err);
//       res.sendStatus(401);
//       return;
//     }
//   });
//   const respn = db.createuserid(vals, (err, result) => {
//     if (err) {
//       console.log(err);
//       res.sendStatus(401);
//       return;
//     } else res.sendStatus(200);
//   });
// });

app.post("/createowner", (req, res) => {
  const ownerid = req.body.ownerId;
  const name = req.body.name;
  const age = req.body.age;
  const aggrement_status = req.body.aggrementStatus;
  const roomno = req.body.roomno;
  const dob = req.body.dob;
  const proof = req.body.adhaar;
  const password = req.body.password;

  const values = [ownerid, name, age, aggrement_status, roomno, dob];
  const proofval = [proof, ownerid];
  const vals = ["o-" + ownerid, password, ownerid];

  db.createowner(values, (err1) => {
    if (err1) {
      console.log("Error creating owner:", err1);
      return res.status(500).send("Error creating owner");
    }

    db.createownerproof(proofval, (err2) => {
      if (err2) {
        console.log("Error creating owner proof:", err2);
        return res.status(500).send("Error creating owner proof");
      }

      db.createuserid(vals, (err3) => {
        if (err3) {
          console.log("Error creating user ID:", err3);
          return res.status(500).send("Error creating user ID");
        }

        // All operations succeeded
        res.sendStatus(200);
      });
    });
  });
});


//get the tenent details fetch all data from table
app.get("/tenantdetails", (req, res) => {
  const rest = db.getdata("tenant", (err, result) => {
    res.send(result);
  });
});

//get the owner details fetch all the data from the table
app.get("/ownerdetails", (req, res) => {
  const rest = db.getdata("owner", (err, result) => {
    res.send(result);
  });
});

//view parkings owned by tenant
app.post("/viewparking", (req, res) => {
  const id = req.body.userId;
  const rest = db.viewparking(id, (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

//get the room details owned by the owner
app.post("/ownercomplaints", (req, res) => {
  const ownerid = req.body.userId;
  const rest = db.ownercomplaints(ownerid, (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

//view complaints that are in the database
app.get("/viewcomplaints", (req, res) => {
  const rest = db.viewcomplaints((err, result) => {
    res.send(result);
  });
});

//getonlycomplaints according to owner
app.post("/ownerroomdetails", (req, res) => {
  const ownerId = req.body.userId;
  const rest = db.ownerroomdetails(ownerId, (err, result) => {
    if (err) console.log(err);
    res.send(result);
  });
});

//books parking slot for tenents
app.post("/bookslot", (req, res) => {
  const roomno = req.body.roomNo;
  const slno = req.body.slotNo;
  const values = [slno, roomno];
  const rest = db.bookslot(values, (err, result) => {
    if (err) console.log(err);
    if (err) res.sendStatus(405);
    else {
      res.sendStatus(200);
    }
  });
});

app.post("/ownertenantdetails", (req, res) => {
  const id = req.body.userId;
  const rest = db.ownertenantdetails(id, (err, result) => {
    if (err) console.log(err);
    if (err) res.sendStatus(405);
    else {
      res.send(result);
    }
  });
});

app.post("/paymaintanance", (req, res) => {
  const id = req.body.userId;
  const rest = db.paymaintanence(id, (err, result) => {
    if (err) console.log(err);
    if (err) res.sendStatus(405);
    else {
      res.sendStatus(200);
    }
  });
});

// app.post("/deletetenant", (req, res) => {
//   const id = req.body.userId;
//   const rest = db.deletetenant(id, (err, result) => {
//     if (err) console.log(err);
//     if (err) res.sendStatus(405);
//     else {
//       res.sendStatus(200);
//       console.log({ result });
//     }
//   });
// });

app.post("/deletetenant", (req, res) => {
  const userId = req.body.userId;

  db.deletetenant(userId, (err, result) => {
    if (err) {
      console.error("Error deleting tenant:", err);
      res.sendStatus(500); // Internal Server Error
    } else {
      console.log("Tenant deleted successfully");
      res.sendStatus(200); // OK
    }
  }

//   const ownerId = 502; // Replace with the actual owner ID
// connection.query('DELETE FROM identity WHERE owner_id = ?', [ownerId], (error, results) => {
//   if (error) {
//     console.error('Error deleting owner:', error);
//   } else {
//     console.log('Owner deleted successfully');
//   }
// }
);
});

// app.delete("/deleteowner", (req, res) => {
//   const id = req.body.userId;
//   const rest = db.deleteowner(id, (err, result) => {
//     if (err) console.log(err);
//     if (err) res.sendStatus(405);
//     else {
//       res.sendStatus(200);
//       console.log({ result });
//     }
//   });
// });

app.post("/deleteowner", (req, res) => {
  const id = req.body.userId;

  db.deleteowner(id, (err, result) => {
    if (err) {
      console.error("Error deleting owner:", err);
      res.sendStatus(500); // Internal Server Error
    } else {
      console.log("Owner deleted successfully");
      res.sendStatus(200); // OK
    }
  });
});


app.post("/deletemployee", (req, res) => {
  const id = req.body.userId;
  const rest = db.deleteemployee(id, (err, result) => {
    if (err) console.log(err);
    if (err) res.sendStatus(405);
    else {
      res.sendStatus(200);
      console.log({ result });
    }
  });
});
app.post("/deletecomplaint", (req, res) => {
  const id = req.body.roomId;
  const rest = db.deletecomplaint(id, (err, result) => {
    if (err) console.log(err);
    if (err) res.sendStatus(405);
    else {
      res.sendStatus(200);
      console.log({ result });
    }
  });
});

//Other routes
app.get("*", function (req, res) {
  res.send("Sorry, this is an invalid URL.");
});