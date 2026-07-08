import io
import base64
from datetime import datetime
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def get_aspect_ratio_image(b64_str: str, target_width: float = 200.0) -> Image:
    """
    Decodes a base64 image string, loads it in PIL to determine aspect ratio,
    and returns a ReportLab Image flowable scaled proportionally.
    """
    if "," in b64_str:
        b64_str = b64_str.split(",")[1]
        
    img_bytes = base64.b64decode(b64_str)
    img_buf = io.BytesIO(img_bytes)
    
    # Use PIL to read original image shape
    pil_img = PILImage.open(img_buf)
    w, h = pil_img.size
    aspect = h / w
    target_height = target_width * aspect
    
    img_buf.seek(0)
    return Image(img_buf, width=target_width, height=target_height)

def generate_pdf_report(req) -> bytes:
    """
    Generates a structured PDF report for VisionLab and returns raw PDF bytes.
    """
    pdf_buffer = io.BytesIO()
    
    # 1. Initialize Document
    # Margins: 0.5 inch (36 points)
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    primary_color = colors.HexColor("#0f172a") # Dark Slate
    secondary_color = colors.HexColor("#06b6d4") # Brand Cyan
    accent_color = colors.HexColor("#8b5cf6") # Brand Violet
    text_dark = colors.HexColor("#1e293b")
    text_muted = colors.HexColor("#64748b")
    
    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=24,
        textColor=secondary_color,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        textColor=colors.HexColor("#ffffff"),
        spaceAfter=15
    )
    
    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=8,
        borderPadding=(0, 0, 2, 0),
        borderColor=secondary_color,
        borderWidth=1
    )
    
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=text_dark,
        leading=14,
        spaceAfter=10
    )
    
    cell_title_style = ParagraphStyle(
        "CellTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=primary_color
    )
    
    cell_val_style = ParagraphStyle(
        "CellVal",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=text_dark
    )

    story = []
    
    # 2. Header Title Band (Dark Background block)
    header_data = [
        [
            Paragraph("VisionLab Analysis Report", title_style),
            Paragraph(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}<br/>OS: macOS Local", ParagraphStyle("DateStyle", parent=styles["Normal"], textColor=colors.HexColor("#94a3b8"), alignment=2))
        ],
        [
            Paragraph("Digital Image Processing Pipeline Log", subtitle_style),
            Paragraph("", styles["Normal"])
        ]
    ]
    
    header_table = Table(header_data, colWidths=[360, 180])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), primary_color),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("PADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, 0), 16),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 16),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 15))
    
    # 3. Image Metadata Section
    story.append(Paragraph("1. Image Metadata", heading_style))
    
    meta = req.metadata
    meta_rows = [
        [Paragraph("Property", cell_title_style), Paragraph("Value", cell_title_style)],
        [Paragraph("File Name", cell_title_style), Paragraph(str(meta.get("name", "N/A")), cell_val_style)],
        [Paragraph("Resolution (W x H)", cell_title_style), Paragraph(f"{meta.get('width', 'N/A')} x {meta.get('height', 'N/A')} px", cell_val_style)],
        [Paragraph("Format", cell_title_style), Paragraph(str(meta.get("format", "N/A")).upper(), cell_val_style)],
        [Paragraph("Size", cell_title_style), Paragraph(f"{int(meta.get('size', 0)) / 1024:.1f} KB", cell_val_style)],
    ]
    meta_table = Table(meta_rows, colWidths=[200, 340])
    meta_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))
    
    # 4. Parameters Summary
    story.append(Paragraph("2. Process Pipeline Parameters", heading_style))
    param_rows = [[Paragraph("Stage / Module", cell_title_style), Paragraph("Adjusted Settings", cell_title_style)]]
    
    params = req.parameters
    for stage_name, stage_val in params.items():
        if isinstance(stage_val, dict):
            # Format dict as string items
            val_str = ", ".join([f"{k}: {v}" for k, v in stage_val.items() if not isinstance(v, (list, dict))])
            if not val_str:
                val_str = "Default / Dynamic parameters"
        else:
            val_str = str(stage_val)
            
        param_rows.append([
            Paragraph(stage_name.replace("Params", "").capitalize(), cell_title_style),
            Paragraph(val_str, cell_val_style)
        ])
        
    param_table = Table(param_rows, colWidths=[150, 390])
    param_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(param_table)
    story.append(Spacer(1, 15))
    
    # 5. Pipeline Views (Images Grid)
    story.append(Paragraph("3. Processing Stages Visual Output", heading_style))
    
    images_flow = []
    
    # Check what images are available and create grid cells
    # We display them side-by-side or in list flow
    available_imgs = []
    if req.original_image:
        available_imgs.append(("Original Input", req.original_image))
    if req.preprocessed_image:
        available_imgs.append(("3. Preprocessed Preview", req.preprocessed_image))
    if req.color_converted_image:
        available_imgs.append(("4. Color Conversion", req.color_converted_image))
    if req.processed_image:
        available_imgs.append(("7. Processed Output", req.processed_image))
    if req.segmented_image:
        available_imgs.append(("8. Segmentation Map", req.segmented_image))
        
    # Render images side by side or stacked (2 per row is great!)
    image_cells = []
    for title, b64 in available_imgs:
        try:
            rl_img = get_aspect_ratio_image(b64, target_width=250.0)
            cell = [
                Paragraph(f"<b>{title}</b>", ParagraphStyle("ImgTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9, spaceAfter=4, textColor=primary_color)),
                rl_img,
                Spacer(1, 10)
            ]
            image_cells.append(cell)
        except Exception as e:
            # Handle error gracefully
            image_cells.append([Paragraph(f"Error loading {title}: {str(e)}", cell_val_style)])
            
    # Structure cells into pairs (2-column layout)
    grid_data = []
    for i in range(0, len(image_cells), 2):
        row = []
        row.append(image_cells[i])
        if i + 1 < len(image_cells):
            row.append(image_cells[i + 1])
        else:
            row.append([]) # Empty cell
        grid_data.append(row)
        
    if grid_data:
        # ColWidths: 260 and 260
        grid_table = Table(grid_data, colWidths=[270, 270])
        grid_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        story.append(grid_table)
        
    story.append(Spacer(1, 15))
    
    # 6. Analysis Note
    if req.report_notes:
        story.append(KeepTogether([
            Paragraph("4. Analysis Summary & Notes", heading_style),
            Paragraph(req.report_notes, body_style)
        ]))
        
    # Build Document
    doc.build(story)
    
    pdf_bytes = pdf_buffer.getvalue()
    pdf_buffer.close()
    return pdf_bytes
