from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.units import inch
from datetime import datetime
import io

def generate_incident_pdf(session_id: str, events: list, narrative: str = None) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.hexColor("#00D4FF"),
        spaceAfter=10
    )
    
    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=12,
        spaceAfter=6
    )
    
    elements = []
    
    # 1. Header
    elements.append(Paragraph("ELYAITRA SENTINEL — INCIDENT REPORT", title_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.hexColor("#00D4FF"), spaceAfter=20))
    
    # 2. Metadata Table
    metadata_data = [
        ["Session ID", session_id],
        ["Generated At", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")],
        ["Event Count", str(len(events))],
        ["Severity Assessment", "HIGH" if len(events) > 5 else "MEDIUM"]
    ]
    
    meta_table = Table(metadata_data, colWidths=[1.5*inch, 4*inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # 3. AI Narrative
    if narrative:
        elements.append(Paragraph("AI Forensics Analysis", header_style))
        elements.append(Paragraph(narrative, styles['BodyText']))
        elements.append(Spacer(1, 0.3*inch))
        
    # 4. Attack Timeline
    elements.append(Paragraph("Attack Timeline", header_style))
    
    timeline_data = [["Timestamp", "IP Address", "Attack Type", "MITRE", "Honeypot"]]
    for e in events:
        timeline_data.append([
            e.timestamp.strftime("%H:%M:%S"),
            e.ip,
            e.attack_type,
            e.mitre_technique or "N/A",
            e.honeypot_served or "None"
        ])
        
    timeline_table = Table(timeline_data, colWidths=[1.2*inch, 1.2*inch, 1.5*inch, 1*inch, 1*inch])
    timeline_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.hexColor("#00D4FF")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(timeline_table)
    
    # Footer handled by doc.build callback
    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.drawString(inch, 0.75 * inch, f"Page {doc.page} - Confidential Incident Report")
        canvas.restoreState()
        
    doc.build(elements, onFirstPage=footer, onLaterPages=footer)
    
    pdf_content = buffer.getvalue()
    buffer.close()
    return pdf_content
