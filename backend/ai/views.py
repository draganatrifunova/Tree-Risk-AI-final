"""
ai/views.py  (updated)
======================
Exposes three endpoints under /api/ai/ :

  POST /api/ai/detect/        – placeholder image-based tree detection (unchanged)
  POST /api/ai/ml/train/      – (re)trains the ML model and returns metrics
  POST /api/ai/ml/predict/    – runs ML inference for a single tree observation
"""

import logging

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .tree_detection import detect_trees_placeholder
from .risk_model import train_model, predict as ml_predict

logger = logging.getLogger(__name__)


# ── existing view (unchanged) ──────────────────────────────────────────────

class DetectTreesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        image = request.FILES.get("image")
        if not image:
            return Response({"detail": "image is required."}, status=status.HTTP_400_BAD_REQUEST)
        result = detect_trees_placeholder(image)
        return Response(result, status=status.HTTP_200_OK)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NEW: ML Training endpoint
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MLTrainView(APIView):
    """
    POST /api/ai/ml/train/
    ----------------------
    (Re)trains the RandomForest model and saves model.pkl.
    Admin-only endpoint (IsAdminUser).

    Request body (all optional):
    {
        "n_estimators": 200,   // number of trees in the forest
        "test_size":    0.20   // fraction held out for evaluation
    }

    Response:
    {
        "status": "ok",
        "mae":        float,
        "r2":         float,
        "train_rows": int,
        "test_rows":  int,
        "model_path": str
    }
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        n_estimators = int(request.data.get("n_estimators", 200))
        test_size    = float(request.data.get("test_size",    0.20))

        try:
            metrics = train_model(n_estimators=n_estimators, test_size=test_size)
        except Exception as exc:
            logger.exception("[MLTrainView] Training failed")
            return Response(
                {"detail": f"Training failed: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"status": "ok", **metrics}, status=status.HTTP_200_OK)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NEW: ML Predict endpoint
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MLPredictView(APIView):
    """
    POST /api/ai/ml/predict/
    ------------------------
    Runs ML inference for a single tree observation.
    Falls back to the deterministic formula when model.pkl is absent.

    Request body (all required):
    {
        "height":           float,             // metres
        "tilt":             float,             // degrees
        "health_condition": "GOOD"|"FAIR"|"POOR",
        "wind_speed":       float,             // m/s
        "precipitation":    float              // mm/h
    }

    Response:
    {
        "risk_score": float,          // 0–100
        "risk_category": "LOW"|"MEDIUM"|"HIGH",
        "source": "ml"|"deterministic"
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    REQUIRED_FIELDS = ["height", "tilt", "health_condition", "wind_speed", "precipitation"]

    def post(self, request):
        # ── validate input ────────────────────────────────────────────────
        missing = [f for f in self.REQUIRED_FIELDS if request.data.get(f) is None]
        if missing:
            return Response(
                {"detail": f"Missing required fields: {missing}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            height           = float(request.data["height"])
            tilt             = float(request.data["tilt"])
            health_condition = str(request.data["health_condition"]).upper()
            wind_speed       = float(request.data["wind_speed"])
            precipitation    = float(request.data["precipitation"])
        except (ValueError, TypeError) as exc:
            return Response(
                {"detail": f"Invalid input: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if health_condition not in ("GOOD", "FAIR", "POOR"):
            return Response(
                {"detail": "health_condition must be GOOD, FAIR, or POOR"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── run prediction ────────────────────────────────────────────────
        try:
            result = ml_predict(
                height=height,
                tilt=tilt,
                health_condition=health_condition,
                wind_speed=wind_speed,
                precipitation=precipitation,
            )
        except Exception as exc:
            logger.exception("[MLPredictView] Prediction failed")
            return Response(
                {"detail": f"Prediction error: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        score = result["risk_score"]
        if score <= 35:
            category = "LOW"
        elif score <= 65:
            category = "MEDIUM"
        else:
            category = "HIGH"

        return Response(
            {
                "risk_score":     score,
                "risk_category":  category,
                "source":         result["source"],
            },
            status=status.HTTP_200_OK,
        )
