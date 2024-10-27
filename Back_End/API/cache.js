
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


// ANCHOR - VIEW CLASSMATES ASSIGNEMNT
app.get(`/view/classmate/assignment/:Student_ID`, verifyToken, async (req, res) => {

    const { Student_ID } = req.params;

    const query = `SELECT * FROM Assignment WHERE Student_ID = ?`;

    connection.query(query, [Student_ID], (err, rows) => {

        if(err){

            return res.status(500).json({ error: err.message });

        }

        if(rows.length > 0){

            res.status(200).json(rows);

        }else{

            res.status(404).json({ msg: `No Assignment found` });

        }

    });

});


// ANCHOR - VIEW CLASSMATES ASSIGNEMNT
app.get(`/view/classmate/seatwork/:Student_ID`, verifyToken, async (req, res) => {

    const { Student_ID } = req.params;

    const query = `SELECT * FROM SeatWork WHERE Student_ID = ?`;

    connection.query(query, [Student_ID], (err, rows) => {

        if(err){

            return res.status(500).json({ error: err.message });

        }

        if(rows.length > 0){

            res.status(200).json(rows);

        }else{

            res.status(404).json({ msg: `No Seat Works found` });

        }

    });

});


// ANCHOR - VIEW CLASSMATES ASSIGNEMNT
app.get(`/view/classmate/exampaper/:Student_ID`, verifyToken, async (req, res) => {

    const { Student_ID } = req.params;

    const query = `SELECT * FROM ExamPapers WHERE Student_ID = ?`;

    connection.query(query, [Student_ID], (err, rows) => {

        if(err){

            return res.status(500).json({ error: err.message });

        }

        if(rows.length > 0){

            res.status(200).json(rows);

        }else{

            res.status(404).json({ msg: `No Examination Papers found` });

        }

    });

});