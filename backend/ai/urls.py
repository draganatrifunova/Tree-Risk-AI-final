"""
ai/urls.py  (updated)
=====================
URL patterns for the ai Django app.

Endpoints
---------
POST  /api/ai/detect/        – image-based tree detection (placeholder)
POST  /api/ai/ml/train/      – (re)train the ML model   [admin only]
POST  /api/ai/ml/predict/    – ML risk-score prediction  [authenticated]
"""

from django.urls import path
from .views import DetectTreesView, MLTrainView, MLPredictView

urlpatterns = [
    path("detect/",      DetectTreesView.as_view(), name="ai-detect"),
    path("ml/train/",    MLTrainView.as_view(),     name="ml-train"),
    path("ml/predict/",  MLPredictView.as_view(),   name="ml-predict"),
]
