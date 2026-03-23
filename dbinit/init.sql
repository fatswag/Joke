CREATE TABLE IF NOT EXISTS types (
  type_id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS jokes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_id INT NOT NULL,
  setup TEXT NOT NULL,
  punchline TEXT NOT NULL,
  FOREIGN KEY (type_id) REFERENCES types(type_id)
);

INSERT IGNORE INTO types (type_id, type_name) VALUES
(1, 'general'),
(2, 'programming'),
(3, 'knock-knock');

INSERT IGNORE INTO jokes (type_id, setup, punchline) VALUES
(1, 'Why did the scarecrow win an award?', 'Because he was outstanding in his field.'),
(2, 'Why do programmers prefer dark mode?', 'Because light attracts bugs.'),
(3, 'Knock knock.', 'Who''s there?');