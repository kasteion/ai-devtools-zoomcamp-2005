# 01-todo

A simple Django-based todo list application that allows users to create, view, update, and delete todo items.

## Features

- Create new todo items with title and description
- View all todos sorted by creation date
- Update existing todos
- Mark todos as completed
- Delete todos
- Success messages for user actions

## Requirements

- Python >= 3.13
- Django >= 5.2.8

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd 01-todo
   ```

2. Install dependencies using uv:

   ```bash
   uv sync
   ```

3. Run database migrations:

   ```bash
   python manage.py migrate
   ```

4. Start the development server:

   ```bash
   python manage.py runserver
   ```

5. Open your browser and navigate to `http://127.0.0.1:8000/`

## Usage

- **Home Page**: View all your todos
- **Add Todo**: Click "Add Todo" to create a new todo item
- **Edit Todo**: Click on a todo title to edit it
- **Delete Todo**: Click "Delete" on a todo to remove it
- **Mark Complete**: Use the checkbox to mark todos as completed

## Project Structure

- `todos/models.py`: Todo model definition
- `todos/views.py`: Class-based views for CRUD operations
- `todos/forms.py`: Todo form for creating/updating todos
- `templates/`: HTML templates for the application
- `static/`: Static files (CSS, JS, images)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
