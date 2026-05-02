from io import BytesIO
from django.core.files.base import ContentFile
from django.http import FileResponse
from django.utils import timezone
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from trees.models import Tree

from .models import Report


class GenerateReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trees = Tree.objects.all()
        total = trees.count()
        high_risk = trees.filter(risk_category="HIGH")

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        pdf.drawString(50, 800, f"Tree Risk AI Report - {timezone.now().date()}")
        pdf.drawString(50, 775, f"Total Trees: {total}")
        pdf.drawString(50, 755, f"High Risk Trees: {high_risk.count()}")
        pdf.drawString(50, 735, "Recommendation: Prioritize pruning and inspections for high risk trees.")
        y = 700
        for tree in high_risk[:10]:
            pdf.drawString(50, y, f"{tree.species} | Score: {tree.risk_score:.1f} | ({tree.latitude},{tree.longitude})")
            y -= 20
        pdf.showPage()
        pdf.save()
        buffer.seek(0)

        report = Report.objects.create()
        report.file.save(f"report-{timezone.now().strftime('%Y%m%d%H%M%S')}.pdf", ContentFile(buffer.getvalue()))
        report.save()
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename="tree-risk-report.pdf")
