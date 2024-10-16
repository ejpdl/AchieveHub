const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const moment = require('moment');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secret = 'your_jwt_secret';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const logger = (req, res, next) => {

    console.log(`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl} : ${moment().format()}`);

    next();

}

app.use(logger);

const connection = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "",
    database: "digital_portfolio"

});

connection.connect((err) => {

    if(err){

        console.log(`Error Connecting on the database MYSQL: ${err}`);
        return;

    }else{

        console.log(`Successfully Connected to MYSQL -Digital Portfolio-`);

    }

});


// JSON WEB TOKEN (FOR AUTHENTICATION AND AUTHORIZATION)
const verifyToken = async (req, res, next) => {

    try{

        const token = await req.headers['authorization'];

        if(!token){

            return res.status(403).json({ msg: `Access Denied. No token Provided` });

        }

        jwt.verify(token, secret, async (err, decoded) => {

            if(err){

                return res.status(401).json({ msg: `Invalid Token` });

            }

            req.user = await decoded;
            next();

        });

    }catch(error){

        console.log(error);

    }

};


// LOG IN API
app.post(`/credentials/login`, async (req, res) => {

    try{

        const { Student_ID, password } = req.body;

        if(!Student_ID || !password){

            return res.status(400).json({ msg: `Student ID and Password are required` });

        }

        const query = `SELECT * FROM login_credentials WHERE Student_ID = ?`;

        connection.query(query, [Student_ID, password], async (err, rows) => {

            if(err){

                return res.status(500).json({ error: `Database Error` });

            }

            if(rows.length === 0){

                return res.status(401).json({ msg: `Student ID and Password is incorrect` });

            }

            const user = rows[0];

            if(!user.Hash_Password){

                return res.status(500).json({ error: `Password is missing in the database` });

            }

            try{

                const isMatch = await bcrypt.compare(password, user.Hash_Password);

                if(!isMatch){

                    return res.status(401).json({ msg: `Student ID or Password may be incorrect` });

                }

                const token = jwt.sign(

                    { Student_ID: user.Student_ID, Role: user.Role }, secret, { expiresIn: '1h'}

                );

                res.status(200).json({

                    msg: `Login Successful`,
                    token: token,
                    redirectUrl: user.Role === 'admin' ? '../Teacher_Page/teacher.html' : '../Student_User_Page/student.html'

                });

            }catch(error){

                console.error(`Error during password comparison: ${error}`);
                return res.status(500).json({ msg: `Error during password comparison` });

            }

        });

    }catch(error){

        console.log(error);

    }

});


// STUDENT PAGE API
app.get(`/student_user/view/`, verifyToken, async (req, res) => {

    try{

        const { Student_ID } = req.user;

        const query = `SELECT * FROM student_user WHERE Student_ID = ?`;

        connection.query(query, [Student_ID], async (err, rows) => {

            if(err){

                return res.status(500).json({ error: err.message });

            }

            if(rows.length > 0){

                res.status(200).json(rows[0]);

            }else{

                res.status(500).json({ msg: `Student with ID ${Student_ID} is not found` });

            }

        });


    }catch(error){

        console.log(error);

    }

});


// CLASSMATE PAGE API
app.get(`/classmate/view/:Student_ID`, verifyToken, async (req, res) => {

    try{

        const { Student_ID } = req.params;

        const query = `SELECT * FROM student_user WHERE Student_ID = ?`;

        connection.query(query, [Student_ID], async (err, rows) => {

            if(err){

                return res.status(500).json({ error: err.message });

            }

            if(rows.length > 0){

                res.status(200).json(rows[0]);

            }else{

                res.status(404).json({ msg: `Classmate with ID ${Student_ID} is not found` });

            }

        });

    }catch(error){

        console.log(error);

    }

});


// UPDATE A STUDENT USER API
app.put(`/student_user/update`, verifyToken, async (req, res) => {

    try{

        const { First_Name, Middle_Name, Last_Name, Birthday, Age, Gender, Email, Grade_Section, About_Me, Student_ID } = req.body;

        if(!Student_ID){

            return res.status(400).json({ error: `Student ID is required for updating` });

        }

        const query = `UPDATE student_user SET First_Name = ?, Middle_Name = ?, Last_Name = ?, Birthday = ?, \`Age\` = ?, Gender = ?, Email = ?, Grade_Section = ?, About_Me = ? WHERE Student_ID = ?`;

        connection.query(query, [First_Name, Middle_Name, Last_Name, Birthday, Age, Gender, Email, Grade_Section, About_Me, Student_ID], (err, results) => {

            if(err){

                return res.status(500).json({ error: err.message });

            }

            if(results.affectedRows === 0){

                return res.status(404).json({ error: `No student found with the provided ID` });

            }

            res.status(200).json({ msg: `Successfully Updated` });

        });


    }catch(error){

        console.log(error);

    }

});



const PORT = process.env.PORT || 5000;

app.listen(5000, () => {

    console.log(`The Server API is running at PORT ${PORT}`);

});