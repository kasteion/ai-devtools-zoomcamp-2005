from django.test import TestCase
from django.urls import reverse
from .models import Todo

class TodoModelTest(TestCase):
    def test_todo_creation(self):
        todo = Todo.objects.create(
            title="Test Todo",
            description="Test description",
            completed=False
        )
        self.assertEqual(todo.title, "Test Todo")
        self.assertEqual(todo.description, "Test description")
        self.assertFalse(todo.completed)
        self.assertIsNotNone(todo.created_at)
        self.assertIsNotNone(todo.updated_at)

    def test_todo_str_method(self):
        todo = Todo.objects.create(title="Test Todo")
        self.assertEqual(str(todo), "Test Todo")

class TodoViewTest(TestCase):
    def setUp(self):
        self.todo = Todo.objects.create(
            title="Test Todo",
            description="Test description",
            completed=False
        )

    def test_todo_list_view(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Test Todo")
        self.assertTemplateUsed(response, 'home.html')

    def test_todo_create_view_get(self):
        response = self.client.get(reverse('todo_create'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo_form.html')

    def test_todo_create_view_post(self):
        data = {
            'title': 'New Todo',
            'description': 'New description',
            'completed': False
        }
        response = self.client.post(reverse('todo_create'), data)
        self.assertEqual(response.status_code, 302)  # Redirect after success
        self.assertEqual(Todo.objects.count(), 2)
        new_todo = Todo.objects.get(title='New Todo')
        self.assertEqual(new_todo.description, 'New description')

    def test_todo_update_view_get(self):
        response = self.client.get(reverse('todo_update', kwargs={'pk': self.todo.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo_form.html')
        self.assertContains(response, "Test Todo")

    def test_todo_update_view_post(self):
        data = {
            'title': 'Updated Todo',
            'description': 'Updated description',
            'completed': True
        }
        response = self.client.post(reverse('todo_update', kwargs={'pk': self.todo.pk}), data)
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, 'Updated Todo')
        self.assertTrue(self.todo.completed)

    def test_todo_delete_view_get(self):
        response = self.client.get(reverse('todo_delete', kwargs={'pk': self.todo.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo_confirm_delete.html')

    def test_todo_delete_view_post(self):
        response = self.client.post(reverse('todo_delete', kwargs={'pk': self.todo.pk}))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Todo.objects.count(), 0)
