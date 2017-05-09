create table todo_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  is_finished BOOLEAN NOT NULL
);

INSERT INTO todo_items (title, description, is_finished) VALUES ('COMP307Assignment3', 'no description at all', FALSE);
INSERT INTO todo_items (title, description, is_finished) VALUES ('COMP307Assignment2', 'Genetic programming, sounds fun', FALSE);
INSERT INTO todo_items (title, description, is_finished) VALUES ('KEEP ACING IT', 'On whatever things', FALSE);
INSERT INTO todo_items (title, description, is_finished) VALUES ('Watch Fate of the Furious', 'MUST DOOOOOOO!!!!', TRUE);
INSERT INTO todo_items (title, description, is_finished) VALUES ('Buy some milk', 'or buy whatever you can get', FALSE);
INSERT INTO todo_items (title, description, is_finished) VALUES ('SWEN301Assignment2', 'just get boring paperworks done', TRUE);
INSERT INTO todo_items (title, description, is_finished) VALUES ('NWEN304ProjectPart2', 'A online to-do list app eh?', TRUE);
