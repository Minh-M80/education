USE education;

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id VARCHAR(255) PRIMARY KEY,
    assignment_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade INT,
    feedback TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exercise_submissions (
    id VARCHAR(255) PRIMARY KEY,
    exercise_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    answers JSON,
    total_score INT NOT NULL DEFAULT 0,
    max_score INT NOT NULL DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_spent INT DEFAULT 0,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
