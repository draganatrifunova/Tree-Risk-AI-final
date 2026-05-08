"""
management/commands/train_risk_model.py
=======================================
Django management command that trains (or retrains) the ML risk model.

Usage
-----
    python manage.py train_risk_model
    python manage.py train_risk_model --estimators 300 --test-size 0.25

This is the recommended way to trigger training in production because it
runs inside the full Django environment (correct working directory, settings
already loaded, etc.).
"""

from django.core.management.base import BaseCommand
from ai.risk_model import train_model


class Command(BaseCommand):
    help = "Train (or retrain) the RandomForest tree-risk ML model."

    def add_arguments(self, parser):
        parser.add_argument(
            "--estimators",
            type=int,
            default=200,
            help="Number of trees in the RandomForest (default: 200)",
        )
        parser.add_argument(
            "--test-size",
            type=float,
            default=0.20,
            help="Fraction of data held out for evaluation (default: 0.20)",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting model training …"))

        metrics = train_model(
            n_estimators=options["estimators"],
            test_size=options["test_size"],
        )

        self.stdout.write(self.style.SUCCESS(f"\n  ✔ Model saved  → {metrics['model_path']}"))
        self.stdout.write(f"  ✔ MAE          → {metrics['mae']}")
        self.stdout.write(f"  ✔ R²           → {metrics['r2']}")
        self.stdout.write(f"  ✔ Train rows   → {metrics['train_rows']}")
        self.stdout.write(f"  ✔ Test  rows   → {metrics['test_rows']}")
        self.stdout.write(self.style.SUCCESS("\nDone."))
