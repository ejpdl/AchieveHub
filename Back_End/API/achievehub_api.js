// ANCHOR - MIDDLEWARES
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const moment = require('moment');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const secret = 'your_jwt_secret';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/artifacts', express.static('artifacts'));
app.use(express.urlencoded({ extended: true }));

const logger = (req, res, next) => {

    console.log(`${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl} : ${moment().format()}`);

    next();

}

app.use(logger);

const connection = mysql.createConnection({

    host: "bbt1csvr4zje6mg11fyr-mysql.services.clever-cloud.com",
    user: "uocfurc7vwgk2ekb",
    password: "6XmBc3JatAVZEB9W0iHo",
    database: "bbt1csvr4zje6mg11fyr"

});

connection.connect((err) => {

    if(err){

        console.log(`Error Connecting on the database MYSQL: ${err}`);
        return;

    }else{

        console.log(`Successfully Connected to MYSQL -Digital Portfolio-`);

    }

});

// ANCHOR - UPLOAD USER IMAGE
const fileStorage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, './uploads');

    },

    filename: (req, file, cb) => {

        cb(null, Date.now() + '--' + file.originalname);

    }

});

const upload = multer({ storage: fileStorage });


// ANCHOR - UPLOAD ARTIFACTS
const artifactsStorage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, './artifacts');

    },

    filename: (req, file, cb) => {

        cb(null,  Date.now() + '--' + file.originalname);

    }

});

const uploadArtifacts = multer({ storage: artifactsStorage });


// ANCHOR - TO TEST IF ITS UPLOADING
app.post('/single', uploadArtifacts.single('artifact'), (req, res) => {

    if(req.file){

        res.json({

            message: 'File uploaded successfully',
            filename: req.file.filename

        });

    }else{

        res.status(400).json({ message: 'No file uploaded' });

    }

});

app.post('/multiple', upload.array('images', 5), (req, res) => {

    console.log(req.file);
    res.send(`Successfully uploaded multiple files`);

});


// ANCHOR - JSON WEB TOKEN (FOR AUTHENTICATION AND AUTHORIZATION)
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


// ANCHOR - LOG IN API
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


// ANCHOR - STUDENT PAGE API
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

            const student = rows[0];

            student.Profile_Picture = student.Profile_Picture ? `http://localhost:5000/uploads${student.Profile_Picture}` : null;

        });


    }catch(error){

        console.log(error);

    }

});

// ANCHOR - CLASSMATE PAGE API
app.get(`/classmate/view/:Student_ID`, verifyToken, async (req, res) => {

    try{

        const { Student_ID } = req.params;

        const query = `SELECT * FROM student_user WHERE Student_ID = ?`;

        connection.query(query, [Student_ID], async (err, rows) => {

            if(err){

                return res.status(500).json({ error: err.message });

            }

            if(rows.length > 0){

                const classmate = rows[0];

                if(classmate.hide_demographics){

                    delete classmate.Age;
                    delete classmate.Birthday;
                    delete classmate.Phone_Number;
                    delete classmate.Email;

                }

                res.status(200).json(classmate);

            }else{

                res.status(404).json({ msg: `Classmate with ID ${Student_ID} is not found` });

            }

        });

    }catch(error){

        console.log(error);
        res.status(500).json({ msg: `Server Error` });

    }

});


// ANCHOR - TO SHOW AND TO HIDE DEMOGRAPHICS
app.post(`/student_user/privacy`, verifyToken, async (req, res) => {

    try{

        const { Student_ID } = req.user;
        const { hide_demographics } = req.body;

        const query = `UPDATE student_user SET hide_demographics = ? WHERE Student_ID = ?`;

        connection.query(query, [hide_demographics, Student_ID], (err, result) => {

            if(err){

                return res.status(500).json({ error: err.message });

            }   

            res.status(200).json({ msg: `Privacy settings updated successfully` });

        });

    }catch(error){

        console.log(error);
        res.status(500).json({ msg: "Server Error" });

    }

})


// ANCHOR - UPDATE A STUDENT USER API
app.put(`/student_user/update`, verifyToken, upload.single('image'), async (req, res) => {

    try{

        const { First_Name, Middle_Name, Last_Name, Birthday, Age, Gender, Email, Grade_Level, Section, About_Me, Student_ID } = req.body;

        if(!Student_ID){

            return res.status(400).json({ error: `Student ID is required for updating` });

        }

        let profile = null;

        if(req.file){

            profile = `uploads/${req.file.filename}`;

        }

        const query = `UPDATE student_user SET First_Name = ?, Middle_Name = ?, Last_Name = ?, Birthday = ?, \`Age\` = ?, Gender = ?, Email = ?, Grade_Level = ?, Section = ?, About_Me = ?, Profile_Picture = ? WHERE Student_ID = ?`;

        connection.query(query, [First_Name, Middle_Name, Last_Name, Birthday, Age, Gender, Email, Grade_Level, Section, About_Me, profile, Student_ID], (err, results) => {

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


// ANCHOR - QUIZ UPLOAD
app.post(`/upload/quiz`, verifyToken, uploadArtifacts.single('file'), async (req, res) => {

    try{

        const { title, subject } = req.body;

        const { Student_ID } = req.user;

        let filePath = null;

        if(req.file){

            filePath = `artifacts/${req.file.filename}`;

        }

        const query = `INSERT INTO Quiz (Title, Subject, File, Student_ID) VALUES (?, ?, ?, ?)`;

        connection.query(query, [title, subject, filePath, Student_ID], (err, results) => {

            if(err){

                return res.status(500).json({ error: err.message });

            }

            if(results.affectedRows === 0){

                return res.status(404).json({ error: `No record inserted` });

            }

            res.status(200).json({

                msg: `Successfully Uploaded`,
                title: title,
                subject: subject,
                file_path: filePath

            });

        });

    }catch(e){

        console.log(e);
        res.status(500).json({ error: 'Server error' });

    }

});


// ANCHOR - UPLAOAD PERFORMANCE TASK
app.post(`/upload/performance_task`, verifyToken, uploadArtifacts.single('file'), async (req, res) => {

    try{

        const { title, subject } = req.body;

        const { Student_ID } = req.user;

        let filePath = null;

        if(req.file){

            filePath = `artifacts/${req.file.filename}`;

        }

        const query = `INSERT INTO Performance_Task (Title, Subject, File, Student_ID) VALUES (?, ?, ?, ?)`;

        connection.query(query, [title, subject, filePath, Student_ID], (err, results) => {

            if(err){

                return res.status(500).json({ error: err.message });

            }

            if(results.affectedRows === 0){

                return res.status(404).json({ error: `No record inserted` });

            }

            res.status(200).json({

                msg: `Successfully Uploaded`,
                title: title,
                subject: subject,
                file_path: filePath

            });

        });

    }catch(e){

        console.log(e);
        res.status(500).json({ error: 'Server error' });

    }

});

// ANCHOR - VIEW QUIZ ARTIFACTS
app.get(`/view/quiz`, verifyToken, async (req, res) => {

    try{

        const { Student_ID } = req.user;

        const query = `SELECT * FROM Quiz WHERE Student_ID = ?`;

        connection.query(query, [Student_ID], (err, results) => {

            if(err){

                return res.status(500).json({ error: err.message });

            }

            res.status(200).json(results);

        });

    }catch(e){

        console.log(e);
        res.status(500).json({ error: 'Server error' });

    }

});


// ANCHOR - VIEW CLASSMATES QUIZ
app.get(`/view/classmate/quizzes/:Student_ID`, verifyToken, async (req, res) => {

    const { Student_ID } = req.params;

    const query = `SELECT * FROM Quiz WHERE Student_ID = ?`;

    connection.query(query, [Student_ID], (err, rows) => {

        if(err){

            return res.status(500).json({ error: err.message });

        }

        if(rows.length > 0){

            res.status(200).json(rows);

        }else{

            res.status(404).json({ msg: `No quizzes found` });

        }

    });

});


// ANCHOR - VIEW PERFORMANCE TASK
app.get(`/view/performance_task`, verifyToken, async (req, res) => {

    try{

        const { Student_ID } = req.user;

        const query = `SELECT * FROM performance_task WHERE Student_ID = ?`;

        connection.query(query, [Student_ID], (err, results) => {

            if(err){

                return res.status(500).json({ error: err.message });

            }

            res.status(200).json(results);

        });

    }catch(e){

        console.log(e);
        res.status(500).json({ error: 'Server error' });

    }

});


// ANCHOR - VIEW CLASSMATES PERFORMANCE TASK
app.get(`/view/classmate/performance_task/:Student_ID`, verifyToken, async (req, res) => {

    const { Student_ID } = req.params;

    const query = `SELECT * FROM Performance_Task WHERE Student_ID = ?`;

    connection.query(query, [Student_ID], (err, rows) => {

        if(err){

            return res.status(500).json({ error: err.message });

        }

        if(rows.length > 0){

            res.status(200).json(rows);

        }else{

            res.status(404).json({ msg: `No performance task found` });

        }

    });

});

// ANCHOR - DELETE AN ARTIFACT
app.delete(`/upload/delete-Q`, verifyToken, async (req, res) => {

    const { id } = req.body;

    const query = `DELETE FROM quiz WHERE id = ?`;

    connection.query(query, [id], (err, rows) => {

        if(err){

            return res.status(500).json({ error: err.message });

        }

        res.status(200).json({ msg: `Successfully Deleted!` });

    });

});

app.delete(`/upload/delete-PT`, verifyToken, async (req, res) => {

    const { id } = req.body;

    const query = `DELETE FROM performance_task WHERE id = ?`;

    connection.query(query, [id], (err, rows) => {

        if(err){

            return res.status(500).json({ error: err.message });

        }

        res.status(200).json({ msg: `Successfully Deleted!` });

    });

});

//ANCHOR - UPLOAD THE IMAGE IN THE ARTIFACTS
app.post(`/upload/artifacts`, verifyToken, upload.single('file'), async (req, res) => {

    try {

        const { title, subject, material_type } = req.body;

        let filePath = null;

        if(req.file){

            filePath = `uploads/${req.file.filename}`;

        }

        const query = `INSERT INTO materials (title, subject, material_type, file_path) VALUES (?, ?, ?, ?)`;

        connection.query(query, [title, subject, material_type, filePath], (err, results) => {

            if(err){

                return res.status(500).json({ error: err.message });

            }

            if(results.affectedRows === 0){

                return res.status(404).json({ error: `No record inserted` });

            }

            res.status(200).json({

                msg: `Successfully Uploaded`,
                file_path: filePath

            });

        });

    }catch(e){

        console.log(e);
        res.status(500).json({ error: 'Server error' });

    }

});

// ANCHOR - VIEW CLASSMATES ARTIFACTS
app.get(`/view/classmate/artifacts/:Student_ID`, verifyToken, async (req, res) => {

    const { Student_ID } = req.params;

    const quiz = `
    SELECT q.*, s.First_Name, s.Last_Name 
    FROM Quiz q 
    JOIN student_user s ON q.Student_ID = s.Student_ID 
    WHERE q.Student_ID = ?`;

    const performance = `
    SELECT p.*, s.First_Name, s.Last_Name 
    FROM Performance_Task p 
    JOIN student_user s ON p.Student_ID = s.Student_ID 
    WHERE p.Student_ID = ?`;


    try {
       
        const [quizResults, performanceTaskResults] = await Promise.all([

            new Promise((resolve, reject) => {

                connection.query(quiz, [Student_ID], (err, rows) => {

                    if(err) return reject(err);
                    resolve(rows);

                });

            }),

            new Promise((resolve, reject) => {

                connection.query(performance, [Student_ID], (err, rows) => {

                    if(err) return reject(err);
                    resolve(rows);

                });

            })

        ]);

        const combinedResults = {

            quizzes: quizResults,
            performanceTasks: performanceTaskResults

        };

        res.status(200).json(combinedResults);

    }catch(error){

        res.status(500).json({ error: err.message });

    }

});


// ANCHOR - CREATE ACCOUNT / ADD ACOUNT
app.post(`/credentials/add`, async (req, res) => {

    const { LogIn_ID, Student_ID, Hash_Password, First_Name, Last_Name, role } = req.body;

    if(!['admin', 'student'].includes(role)){

        return res.status(400).json({ error: `Invalid role.` });

    }

    try{

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Hash_Password, salt);

        const query = `INSERT INTO login_credentials (LogIn_ID, Student_ID, Hash_Password, First_Name, Last_Name, Role) VALUES (?, ?, ?, ?, ?, ?)`;

        connection.query(query, [LogIn_ID, Student_ID, hashedPassword, First_Name, Last_Name, role], (err, results) => {

            if(err){

                console.log(err);
                return res.status(500).json({ error: err.message });

            }

            res.status(200).json({ msg: `User registered as ${role}` });

        })

    }catch(error){

        console.log(error);
        res.status(500).json({ error: "Server error during registration." });

    }

});

const PORT = process.env.PORT || 5000;

app.listen(5000, () => {

    console.log(`The Server API is running at PORT ${PORT}`);

});
