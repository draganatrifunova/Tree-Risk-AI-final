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

        # ✅ Title (metadata + centered)
        title = f"Tree Risk AI Report - {timezone.now().date()}"
        pdf.setTitle(title)

        width, height = A4
        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawCentredString(width / 2, 800, title)

        # line under title
        pdf.line(50, 790, width - 50, 790)

        # ✅ spacing (2 rows below line)
        y = 750

        # Total Trees
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, "Total Trees:")
        pdf.setFont("Helvetica", 12)
        pdf.drawString(150, y, f"{total}")

        y -= 20

        # High Risk Trees
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, "High Risk Trees:")
        pdf.setFont("Helvetica", 12)
        pdf.drawString(150, y, f"{high_risk.count()}")

        y -= 20

        # Recommendation
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, "Recommendation:")
        pdf.setFont("Helvetica", 12)
        pdf.drawString(160, y, "Prioritize pruning and inspections for high risk trees.")

        # Space before list
        y -= 40

        # High risk trees list
        for tree in high_risk[:10]:
            pdf.drawString(
                50,
                y,
                f"{tree.species} | Score: {tree.risk_score:.1f} | ({tree.latitude},{tree.longitude})"
            )
            y -= 20

        pdf.showPage()
        pdf.save()
        buffer.seek(0)

        # Save report in DB
        report = Report.objects.create()
        report.file.save(
            f"report-{timezone.now().strftime('%Y%m%d%H%M%S')}.pdf",
            ContentFile(buffer.getvalue())
        )
        report.save()

        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename="tree-risk-report.pdf")