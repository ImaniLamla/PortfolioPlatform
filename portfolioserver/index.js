const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require ('bcrypt');
const mysql = require('mysql');
const bodyParser = require('body-parser');

// allows larger JSON / form bodies (for base64 images)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));

app.use(cors({origin: "http://localhost:5173"}));

var db  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    port            : 3307,   
    user            : 'root',
    password        : 'deadnet69',
    database        : 'portfolio_db'
});

//add import now add encryption code
const saltRounds = 10;

app.get('/', (req, res) => {
    res.send('API is running');
});


app.post('/signup', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const profileName = req.body.profileName;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            res.status(418).send('Could not hash password') 
        } else {
            db.query("INSERT INTO users (email, password_hash, profile_name) VALUES (?, ?, ?)", [email, hashedPassword, profileName], (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res
                        .status(418)
                        .send('That email is already registered. Please use another email.');
                    }
                    res.status(418).send('Could not register user.')
                } else {
                    res.send({email: email, profileName: profileName})
                }
            });
        }
    })
    
});

app.post('/signin', (req, res) => {
    const email = req.body.email
    const password = req.body.password
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            res.status(418).send(err.message)
        }
        else if (result.length < 1){
            res.status(418).send('Email does not match!')
        }else {
            bcrypt.compare(password, result[0].password_hash, (err, match) => {
                if (match){
                    res.send({email: result[0].email, profileName: result[0].profile_name})
                }
                if (!match){
                    res.status(418).send('Password does not match!')
                }
            });
        }

    });
})






/* PROFILE: GET existing profile */

app.get('/profile', (req, res) => {
    const email = req.query.email;

    if (!email) {                                                                    // checks if email is present
    return res.status(418).send('Email is required to load profile.');
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, rows) => {      // finds user_id from email
    if (err) {
        console.error('Error finding user by email (GET /profile):', err);
        return res.status(418).send('Error finding user.');
    }

    if (rows.length < 1) {                                                          // if no rows are found with that email
        return res.status(418).send('User not found for that email.');
    }

    const userId = rows[0].id;                                                      // saves user_id associated with email

    db.query(                                                                       // loads profile by user_id
        'SELECT bio, resume_url, github_url, linkedin_url, profile_picture_url FROM profiles WHERE user_id = ? LIMIT 1',
        [userId],
        (err2, rows2) => {
        if (err2) {
            console.error('Error loading profile:', err2);
            return res.status(418).send('Error loading profile.');
        }

        if (rows2.length < 1) {                                                     // if no rows are found with that user_id = no profile
            return res.send({                                                       // returns empty values so UI can still render
            bio: '',
            resumeUrl: '',
            githubUrl: '',
            linkedinUrl: '',
            profilePictureUrl: '',
            });
        }

        const p = rows2[0];                                                         // single profile row
        return res.send({
            bio: p.bio ?? '',                                                       // ?? used to send empty string if field is null
            resumeUrl: p.resume_url ?? '',
            githubUrl: p.github_url ?? '',
            linkedinUrl: p.linkedin_url ?? '',
            profilePictureUrl: p.profile_picture_url ?? '',
        });
        }
    );
    });
});

/* PROFILE: CREATE/UPDATE */
app.post('/profile', (req, res) => {   // pulling fields from JSON payload sent from profile form
    const {      
    email,
    bio,
    resumeUrl,
    githubUrl,
    linkedinUrl,
    profilePictureUrl,
    } = req.body;

    if (!email) {
    return res.status(418).send('Email is required to save profile.');
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, rows) => {            // finds user_id from email
    if (err) {
        console.error('Error finding user by email (POST /profile):', err);
        return res.status(418).send('Error finding user.');
    }

    if (rows.length < 1) {                                                                // if email does not exist in database
        return res.status(418).send('User not found for that email.');
    }

    const userId = rows[0].id;                                                          

    // inserts profile for that user_id or updates it if user_id is already in the table (ON DUPLICATE KEY UPDATE)
    const sql = `
        INSERT INTO profiles
        (user_id, bio, resume_url, github_url, linkedin_url, profile_picture_url)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        bio = VALUES(bio),
        resume_url = VALUES(resume_url),
        github_url = VALUES(github_url),
        linkedin_url = VALUES(linkedin_url),
        profile_picture_url = VALUES(profile_picture_url),
        updated_at = CURRENT_TIMESTAMP
    `;

    db.query(
        sql,
        [userId, bio, resumeUrl, githubUrl, linkedinUrl, profilePictureUrl],
        (err2) => {
        if (err2) {
            console.error('Error saving profile:', err2);
            return res.status(418).send('Error saving profile.');
        }

        return res.send({ message: 'Profile saved successfully.' });
        }
    );
    });
});






/* EXPERIENCES: GET existing experiences */
app.get('/experiences', (req, res) => {
    const email = req.query.email;

    if (!email) {                                                                     // checks if email is present
    return res.status(418).send('Email is required to load experiences.');
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, rows) => {        // tries to find user using their email address
    if (err) {
        console.error('Error finding user by email (GET /experiences):', err);
        return res.status(418).send('Error finding user.');
    }

    if (rows.length < 1) {                                                           // user not found in the database
        return res.status(418).send('User not found for that email.');
    }

    const userId = rows[0].id;                                                      // gets user_id associated with the email address

    // sql query to find all experiences by user_id 
    const sql = `
        SELECT id,
                company_name,
                position_title,
                description,
                is_published
        FROM experiences
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err2, rows2) => {
        if (err2) {
        console.error('Error loading experiences:', err2);
        return res.status(418).send('Error loading experiences.');
    }

    // creates list where each row is changed into a new object in the way the front-end expects it
    const experiences = rows2.map((r) => ({
        id: r.id,
        companyName: r.company_name,
        positionTitle: r.position_title,
        description: r.description || '',
        isPublished: !!r.is_published,          // converts field into a true boolean type (stored as TINYINT (0 or 1) in MySQL)
    }));

    return res.send(experiences);
    });
});
});

{/* EXPERIENCES - INSERT into database  */}
app.post('/experiences', (req, res) => {
    const { email, companyName, positionTitle, description } = req.body;

    if (!email) {                                                                   // checks if email is present
    return res.status(418).send('Email is required to save experience.');
    }

    if (!companyName || !positionTitle || !description) {                           // ensures data is present for NOT NULL fields in database
    return res
        .status(418)
        .send('Company name, position title and description are required.');
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) {
        console.error('Error finding user by email (POST /experiences):', err);
        return res.status(418).send('Error finding user.');
    }

    if (rows.length < 1) {
        return res.status(418).send('User not found for that email.');
    }

    const userId = rows[0].id;

    const sql = `
        INSERT INTO experiences
        (user_id, company_name, position_title, description, is_published)
        VALUES (?, ?, ?, ?, 1)
    `;

    db.query(
        sql,
        [userId, companyName, positionTitle, description || ''],
        (err2, result2) => {
        if (err2) {
            console.error('Error saving experience:', err2);
            return res.status(418).send('Error saving experience.');
        }

        return res.send({
            message: 'Experience saved successfully.',
            experienceId: result2.insertId,
        });
    }
    );
});
});






{/* AWARDS - load awards */}
app.get('/awards', (req, res) => {
    const email = req.query.email;

    if (!email) {
    return res.status(418).send('Email is required to load awards.');               // checks if email exists
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, rows) => {      // finds user_id using email address
    if (err) {
        console.error('Error finding user by email (GET /awards):', err);
        return res.status(418).send('Error finding user.');
    }

    if (rows.length < 1) {                                                          // checks if user exists
        return res.status(418).send('User not found for that email.');
    }

    const userId = rows[0].id;                                                      // retrieves user_id

    // query that returns all awards by the user
    const sql = `
        SELECT id,
                title,
                issuer,
                description,
                issued_date,
                is_published  
        FROM awards
        WHERE user_id = ?
        ORDER BY issued_date DESC, created_at DESC
    `;

    db.query(sql, [userId], (err2, rows2) => {
        if (err2) {
        console.error('Error loading awards:', err2);
        return res.status(418).send('Error loading awards.');
        }

        // creates list where each row is changed into a new object in the way the front-end expects it
        const awards = rows2.map((r) => ({
        id: r.id,
        title: r.title,
        issuer: r.issuer,
        description: r.description || '',
        issuedDate: r.issued_date                                                   // normalizes DATE to a JavaScript Date object YYYY-MM-DD string
            ? r.issued_date.toISOString().slice(0, 10)
            : null,
        isPublished: !!r.is_published,  
        }));

        return res.send(awards);
    });
    });
});


{/* AWARDS - POST  */}
app.post('/awards', (req, res) => {
    const { email, title, issuer, description, issuedDate } = req.body;

    if (!email) {
    return res.status(418).send('Email is required to save award.');
    }

    if (!title) {
    return res.status(418).send('Award title is required.');
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) {
        console.error('Error finding user by email (POST /awards):', err);
        return res.status(418).send('Error finding user.');
    }

    if (rows.length < 1) {
        return res.status(418).send('User not found for that email.');
    }

    const userId = rows[0].id;

    const sql = `
        INSERT INTO awards
        (user_id, title, issuer, description, issued_date, is_published)
        VALUES (?, ?, ?, ?, ?, 1)
    `;

    db.query(
        sql,
        [userId, title, issuer || null, description || '', issuedDate || null],
        (err2, result2) => {
        if (err2) {
            console.error('Error saving award:', err2);
            return res.status(418).send('Error saving award.');
        }

        return res.send({
            message: 'Award saved successfully.',
            awardId: result2.insertId,
        });
        }
    );
    });
});







// takes project's id and list of tag names and checks if the tag exists in the tags table and links each one to a project in project_tags table
function saveTagsForProject(projectId, tagNames, callback) {
    if (!tagNames || tagNames.length === 0) {                           // checks if there are any tags 
    return callback(null);
    }

    let remaining = tagNames.length;                                    // # tags still needing processing
    let done = false;                                                   // safety flag to callback runs once

    const finish = (err) => {
    if (!done) {
        done = true;
        callback(err || null);
    }
    };

    tagNames.forEach((raw) => {
    const tagName = raw.trim();                                         // removes extra spaces around the tag names
    if (!tagName) {                                                     // decrement remaining if tag is empty after trimming
        remaining--;
        if (remaining === 0) finish();
        return;
    }

    // Insert tag or reuse existing (ON DUPLICATE trick)
    const insertTagSql = `
        INSERT INTO tags (name)
        VALUES (?)
        ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)  
    `; // sets LAST_INSERT_ID(id) to existing row's id 

    db.query(insertTagSql, [tagName], (tagErr, tagResult) => {
        if (tagErr) return finish(tagErr);

            const tagId = tagResult.insertId;                           // id of existing tag or newly created tag ID

      // Link project to tag
        const linkSql = `
        INSERT IGNORE INTO project_tags (project_id, tag_id)
        VALUES (?, ?)
        `;
        db.query(linkSql, [projectId, tagId], (linkErr) => {
        if (linkErr) return finish(linkErr);

        remaining--;
        if (remaining === 0) finish();
        });
    });
    });
}



{/* PROJECTS: POST */}
app.post('/projects', (req, res) => {
    const {
    email,
    title,
    shortSummary,
    description,
    techStack,
    liveUrl,
    tags,          
    } = req.body;

    if (!email || !title) {
        return res.status(400).send('Email and title are required.');
    }


    db.query(
    'SELECT id FROM users WHERE email = ?',
    [email],
    (userErr, userRows) => {
        if (userErr) {
            console.error('Error finding user for project:', userErr);
            return res.status(500).send('Server error finding user.');
        }

        if (userRows.length === 0) {
            return res.status(404).send('User not found.');
        }

        const userId = userRows[0].id;

        const insertProjectSql = `
        INSERT INTO projects
            (user_id, title, short_summary, description_md, tech_stack, live_url, is_published)
        VALUES
            (?, ?, ?, ?, ?, ?, 1)
        `;

        db.query(
        insertProjectSql,
        [
            userId,
            title,
            shortSummary || null,
            description || null,
            techStack || null,
            liveUrl || null,
        ],
        (projErr, projResult) => {
            if (projErr) {
                console.error('Error inserting project:', projErr);
                return res.status(500).send('Error saving project.');
            }

            const projectId = projResult.insertId;                             // gets id of project that was recently added

            // handles tags
            let tagNames = [];
            if (Array.isArray(tags)) {                                         // checks if tags from the front-end is an array
            tagNames = tags;
            } else if (typeof tags === 'string') {                             // checks if tags is a comma-separated string
            tagNames = tags.split(',').map((t) => t.trim()).filter(Boolean);   // splits string on commas, removes any whitespace and removes any empty strings
            }

            saveTagsForProject(projectId, tagNames, (tagErr) => {
            if (tagErr) {
                console.error('Error saving project tags:', tagErr);

                // project is saved, tags failed – still return something
                return res
                .status(500)
                .send('Project saved, but there was an error with tags.');
            }

            res.send({
                message: 'Project saved successfully.',
                projectId,
            });
            });
        }
        );
    }
    );
});

{/* PROJECTS: load projects */}
app.get('/projects', (req, res) => {
    const email = req.query.email;

    if (!email) {
    return res.status(400).send('Email required.');
    }

    // finds user
    db.query(
    'SELECT id FROM users WHERE email = ?',
    [email],
    (userErr, userRows) => {
        if (userErr) {
        console.error('Error finding user for projects:', userErr);
        return res.status(500).send('Server error finding user.');
        }
        if (userRows.length === 0) {
        return res.status(404).send('User not found.');
        }

        const userId = userRows[0].id;

        // gets projects + joined tags
        const sql = `
        SELECT
            p.id,
            p.title,
            p.short_summary,
            p.description_md,
            p.tech_stack,
            p.live_url,
            p.created_at,
            p.is_published,
            t.id AS tag_id,
            t.name AS tag_name
        FROM projects p
        LEFT JOIN project_tags pt ON p.id = pt.project_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC, t.name ASC
        `;

        db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching projects:', err);
            return res.status(500).send('Error fetching projects.');
        }

        // groups rows into projects with tags[]
        const projectsMap = {};
        rows.forEach((row) => {
            if (!projectsMap[row.id]) {
            projectsMap[row.id] = {
                id: row.id,
                title: row.title,
                shortSummary: row.short_summary,
                description: row.description_md,
                techStack: row.tech_stack,
                liveUrl: row.live_url,
                isPublished: !!row.is_published,  
                createdAt: row.created_at,
                tags: [],
            };
            }
            if (row.tag_id) {
            projectsMap[row.id].tags.push({
                id: row.tag_id,
                name: row.tag_name,
            });
            }
        });

        res.send(Object.values(projectsMap));
        });
    }
    );
});







// ========= PUBLIC PORTFOLIO ROUTES (only published items) =========

{/* PUBLIC PROFILE */}
app.get('/public/profile', (req, res) => {                  
    const email = req.query.email;                          // needs email address to fetch the users profile 
    if (!email) {                                           // checks if email is present
    return res.status(400).send('Email is required.');
    }

    // gets user info and profile in one go using the email address
    const sql = `
    SELECT 
        u.profile_name,
        p.bio,
        p.resume_url,
        p.github_url,
        p.linkedin_url,
        p.profile_picture_url
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.email = ?
    LIMIT 1
    `;

    db.query(sql, [email], (err, rows) => {
    if (err) {                                                              // error message if unable to load profile
        console.error('Error loading public profile:', err);
        return res.status(500).send('Error loading public profile.');
        }

    if (rows.length < 1) {                                                  // checks to see if user exists
        return res.status(404).send('User not found for that email.');
    }

    const row = rows[0];                                                    // gets row of user's profile fields

    return res.send({                                                       // sends back user's profile information or empty string if null
        profileName: row.profile_name || '',
        bio: row.bio || '',
        resumeUrl: row.resume_url || '',
        githubUrl: row.github_url || '',
        linkedinUrl: row.linkedin_url || '',
        profilePictureUrl: row.profile_picture_url || '',
    });
    });
});


{/* PUBLIC PROJECTS: only published projects for a given user (by email) */}
app.get('/public/projects', (req, res) => {
    const email = req.query.email;
    if (!email) {
    return res.status(400).send('Email is required.');
    }

    // finds user_id from email
    db.query('SELECT id FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) {
        console.error('Error finding user (GET /public/projects):', err);
        return res.status(500).send('Error finding user.');
    }

    if (rows.length < 1) {
        return res.status(404).send('User not found for that email.');
    }

    const userId = rows[0].id;

    // loads only published projects for that user
    const sql = `
        SELECT id,
                title,
                short_summary,
                description_md,
                tech_stack,
                live_url,
                is_published,
                created_at
        FROM projects
        WHERE user_id = ?
            AND is_published = 1
        ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err2, rows2) => {
        if (err2) {
        console.error('Error loading public projects:', err2);
        return res.status(500).send('Error loading projects.');
        }

        // loops over each database row and formats it to be JS friendly 
        const projects = rows2.map((r) => ({
        id: r.id,
        title: r.title,
        shortSummary: r.short_summary,
        description: r.description_md,
        techStack: r.tech_stack,
        liveUrl: r.live_url,
        createdAt: r.created_at,
        isPublished: !!r.is_published, 
        }));

        return res.send(projects);
    });
    });
});


{/* PUBLIC EXPERIENCES: only published experiences for a given user (by email) */}
app.get('/public/experiences', (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).send('Email is required.');

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) {
        console.error('Error finding user (GET /public/experiences):', err);
        return res.status(500).send('Error finding user.');
    }
    if (rows.length < 1) return res.status(404).send('User not found.');

    const userId = rows[0].id;

    const sql = `
        SELECT id, company_name, position_title, description
        FROM experiences
        WHERE user_id = ? AND is_published = 1
        ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err2, rows2) => {
        if (err2) {
        console.error('Error loading public experiences:', err2);
        return res.status(500).send('Error loading experiences.');
        }

        const experiences = rows2.map(r => ({
        id: r.id,
        companyName: r.company_name,
        positionTitle: r.position_title,
        description: r.description || '',
        isPublished: !!r.is_published,
        }));

        res.send(experiences);
    });
    });
});

{/* PUBLIC AWARDS: only published awards for a given user (by email) */}
app.get('/public/awards', (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).send('Email is required.');

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) {
        console.error('Error finding user (GET /public/awards):', err);
        return res.status(500).send('Error finding user.');
    }
    if (rows.length < 1) return res.status(404).send('User not found.');

    const userId = rows[0].id;

    const sql = `
        SELECT id, title, issuer, description, issued_date
        FROM awards
        WHERE user_id = ? AND is_published = 1
        ORDER BY issued_date DESC, created_at DESC
    `;

    db.query(sql, [userId], (err2, rows2) => {
        if (err2) {
        console.error('Error loading public awards:', err2);
        return res.status(500).send('Error loading awards.');
        }

        const awards = rows2.map(r => ({
        id: r.id,
        title: r.title,
        issuer: r.issuer,
        description: r.description || '',
        issuedDate: r.issued_date
            ? r.issued_date.toISOString().slice(0, 10)
            : null,
        isPublished: !!r.is_published,
        }));

        res.send(awards);
    });
    });
});








// PATCH REQUESTS THAT UPDATE is_published ON DATABASE

{/* PROJECTS PATCH */}
app.patch('/projects/:id/publish', (req, res) => {                          
    const projectId = req.params.id;                                        // reads project id from URL
    const { isPublished } = req.body;                                       // true or false from frontend

    db.query(
    'UPDATE projects SET is_published = ? WHERE id = ?',
    [isPublished ? 1 : 0, projectId],                                       // front end will specify if it becomes published or unpublished
    (err, result) => {
        if (err) {
        console.error(err);
        return res.status(500).send('Could not update publish status.');
        }
        res.send({ id: projectId, isPublished: !!isPublished });
    }
    );
});

{/* AWARDS PATCH */}
app.patch('/awards/:id/publish', (req, res) => {
    const projectId = req.params.id;
    const { isPublished } = req.body;     

    db.query(
    'UPDATE awards SET is_published = ? WHERE id = ?',
    [isPublished ? 1 : 0, projectId],
    (err, result) => {
        if (err) {
        console.error(err);
        return res.status(500).send('Could not update publish status.');
        }
        res.send({ id: projectId, isPublished: !!isPublished });
    }
    );
});

{/* EXPERIENCES PATCH */}
app.patch('/experiences/:id/publish', (req, res) => {
    const projectId = req.params.id;
    const { isPublished } = req.body;      // true / false from frontend

    db.query(
    'UPDATE experiences SET is_published = ? WHERE id = ?',
    [isPublished ? 1 : 0, projectId],
    (err, result) => {
        if (err) {
        console.error(err);
        return res.status(500).send('Could not update publish status.');
        }
        res.send({ id: projectId, isPublished: !!isPublished });
    }
    );
});

app.listen(8080, () => {

    console.log('server listening on port 8080');
});
