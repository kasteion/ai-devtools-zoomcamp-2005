from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.contrib import messages
from .models import Todo
from .forms import TodoForm

class TodoListView(ListView):
    model = Todo
    template_name = 'home.html'
    context_object_name = 'todos'
    ordering = ['-created_at']

class TodoCreateView(CreateView):
    model = Todo
    form_class = TodoForm
    template_name = 'todo_form.html'
    success_url = reverse_lazy('home')

    def form_valid(self, form):
        messages.success(self.request, 'Todo created successfully!')
        return super().form_valid(form)

class TodoUpdateView(UpdateView):
    model = Todo
    form_class = TodoForm
    template_name = 'todo_form.html'
    success_url = reverse_lazy('home')

    def form_valid(self, form):
        messages.success(self.request, 'Todo updated successfully!')
        return super().form_valid(form)

class TodoDeleteView(DeleteView):
    model = Todo
    template_name = 'todo_confirm_delete.html'
    success_url = reverse_lazy('home')

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Todo deleted successfully!')
        return super().delete(request, *args, **kwargs)
