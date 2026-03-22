const PDFDocument = require('pdfkit');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// GET /api/certificates/:registrationId
exports.generateCertificate = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.registrationId)
      .populate('user', 'name email department')
      .populate({
        path: 'event',
        populate: { path: 'club', select: 'name' },
      });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (!registration.attended) {
      return res.status(400).json({ success: false, message: 'Certificate available only after attendance confirmation' });
    }

    // Create PDF
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate_${registration._id}.pdf`);
    doc.pipe(res);

    const width = doc.page.width;
    const height = doc.page.height;

    // Background gradient effect
    doc.rect(0, 0, width, height).fill('#0f0c29');
    doc.rect(0, 0, width, height).fill('#1a1a2e');

    // Decorative border
    const borderMargin = 30;
    doc.lineWidth(3)
      .strokeColor('#f7971e')
      .roundedRect(borderMargin, borderMargin, width - borderMargin * 2, height - borderMargin * 2, 15)
      .stroke();

    doc.lineWidth(1)
      .strokeColor('#ffd200')
      .roundedRect(borderMargin + 8, borderMargin + 8, width - (borderMargin + 8) * 2, height - (borderMargin + 8) * 2, 12)
      .stroke();

    // Header ornament
    doc.fontSize(14)
      .fillColor('#f7971e')
      .font('Helvetica')
      .text('★ ★ ★', 0, 60, { align: 'center' });

    // Title
    doc.fontSize(36)
      .fillColor('#ffd200')
      .font('Helvetica-Bold')
      .text('CERTIFICATE', 0, 90, { align: 'center' });

    doc.fontSize(16)
      .fillColor('#e0e0e0')
      .font('Helvetica')
      .text('OF PARTICIPATION', 0, 135, { align: 'center' });

    // Divider
    doc.moveTo(width / 2 - 100, 165)
      .lineTo(width / 2 + 100, 165)
      .strokeColor('#f7971e')
      .lineWidth(2)
      .stroke();

    // Body
    doc.fontSize(13)
      .fillColor('#cccccc')
      .font('Helvetica')
      .text('This is to certify that', 0, 185, { align: 'center' });

    doc.fontSize(28)
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .text(registration.user.name, 0, 210, { align: 'center' });

    if (registration.user.department) {
      doc.fontSize(12)
        .fillColor('#aaaaaa')
        .font('Helvetica')
        .text(`Department: ${registration.user.department}`, 0, 248, { align: 'center' });
    }

    doc.fontSize(13)
      .fillColor('#cccccc')
      .font('Helvetica')
      .text('has successfully participated in', 0, 275, { align: 'center' });

    doc.fontSize(22)
      .fillColor('#f7971e')
      .font('Helvetica-Bold')
      .text(registration.event.title, 0, 300, { align: 'center' });

    doc.fontSize(12)
      .fillColor('#aaaaaa')
      .font('Helvetica')
      .text(
        `Organized by ${registration.event.club?.name || 'College'} on ${new Date(registration.event.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        0,
        335,
        { align: 'center' }
      );

    // Divider
    doc.moveTo(width / 2 - 80, 370)
      .lineTo(width / 2 + 80, 370)
      .strokeColor('#f7971e')
      .lineWidth(1)
      .stroke();

    // Footer
    doc.fontSize(10)
      .fillColor('#888888')
      .text(`Certificate ID: ${registration._id}`, 80, height - 90, { align: 'left' });

    doc.fontSize(10)
      .fillColor('#888888')
      .text(`Issued on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 0, height - 90, { align: 'right', width: width - 80 });

    doc.fontSize(12)
      .fillColor('#f7971e')
      .font('Helvetica-Bold')
      .text('College Event Management System', 0, height - 70, { align: 'center' });

    doc.end();

    // Mark certificate as generated
    registration.certificateGenerated = true;
    await registration.save();
  } catch (error) {
    next(error);
  }
};
