from django.urls import path
from . import views

urlpatterns = [
    path('', views.TodoListView.as_view(), name='home'),
    path('create/', views.TodoCreateView.as_view(), name='todo_create'),
    path('<int:pk>/update/', views.TodoUpdateView.as_view(), name='todo_update'),
    path('<int:pk>/delete/', views.TodoDeleteView.as_view(), name='todo_delete'),
]