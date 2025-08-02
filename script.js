
// Global Variables
let uploadedPhotoData = null;
let formData = {};

document.getElementById('admissionForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Form submitted successfully, generating PDF...');

    const form = e.target;
    const dobInput = form.dob.value;
    if (!dobInput) {
        alert('Please enter a valid date of birth.');
        return;
    }

    const dob = new Date(dobInput);
    if (isNaN(dob.getTime())) {
        alert('Invalid date format. Use YYYY-MM-DD.');
        return;
    }

    const formattedDob = dob.getDate().toString().padStart(2, '0') + '/' +
                         (dob.getMonth() + 1).toString().padStart(2, '0') + '/' +
                         dob.getFullYear().toString().slice(-2);

    const submissionDate = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });

    formData = {
        student_name: form.student_name.value || 'N/A',
        father_name: form.father_name.value || 'N/A',
        mother_name: form.mother_name.value || 'N/A',
        dob: formattedDob,
        gender: form.gender.value || 'N/A',
        class_grade: form.class_grade.value || 'N/A',
        subject_course: form.subject_course.value || 'N/A',
        mobile: form.mobile.value || 'N/A',
        email: form.email.value || 'N/A',
        address: form.address.value || 'N/A',
        submission_date: submissionDate
    };

    document.getElementById('success-message').style.display = 'block';
    generatePDF(); // PDF will download after stamp is loaded

    // Optional: Formspree notification
    try {
        const response = await fetch('https://formspree.io/f/mrblpqbo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) alert('Notification sent via Formspree!');
        else alert('Failed to send notification. Try again.');
    } catch (err) {
        console.log('Formspree error:', err);
        alert('Notification service error. Check console.');
    }
});

document.getElementById('student-photo').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) handlePhotoUpload(file);
});

document.getElementById('camera-btn').addEventListener('click', function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = e => handlePhotoUpload(e.target.files[0]);
    input.click();
});

function handlePhotoUpload(file) {
    if (file.size > 5 * 1024 * 1024) {
        alert('File must be under 5MB');
        return;
    }
    if (!file.type.startsWith('image/')) {
        alert('Invalid file type');
        return;
    }

    const reader = new FileReader();
    reader.onload = e => {
        uploadedPhotoData = e.target.result;
        showPhotoPreview(uploadedPhotoData);
    };
    reader.readAsDataURL(file);
}

function showPhotoPreview(src) {
    document.getElementById('photo-preview').innerHTML = `
        <img src="${src}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', e => {
        if (e.target && e.target.id === 'download-pdf') downloadPDF();
    });
});

function generatePDF() {
    if (!window.jspdf) {
        alert('jsPDF not found. Include https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const footerHeight = 30;
    const footerY = pageHeight - margin - footerHeight;
    const maxSigY = pageHeight - 70;
    let currentY = margin;

    // Border
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(2);
    doc.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - margin * 2 + 10);

    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(margin, currentY, contentWidth, 35, 'F');
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, currentY, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('VISION INSTITUTE OF SCIENCE', pageWidth / 2, currentY + 20, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont(undefined, 'italic');
    doc.text('Learn with Confidence', pageWidth / 2, currentY + 30, { align: 'center' });
    currentY += 40;

    // Title
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, currentY, contentWidth, 15, 'F');
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('ADMISSION CONFIRMATION LETTER', pageWidth / 2, currentY + 10, { align: 'center' });
    currentY += 20;

    // Photo
    const photoX = margin + contentWidth - 40;
    const photoY = currentY;
    doc.setDrawColor(30, 58, 138);
    doc.rect(photoX, photoY, 35, 45);
    if (uploadedPhotoData) {
        try {
            doc.addImage(uploadedPhotoData, 'JPEG', photoX + 2, photoY + 2, 31, 41);
        } catch {
            showPhotoPlaceholder(doc, photoX, photoY);
        }
    } else {
        showPhotoPlaceholder(doc, photoX, photoY);
    }

    currentY += 45;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text('Student Information:', margin, currentY);
    currentY += 12;

    const leftCol = margin;
    const rightCol = margin + contentWidth / 2;
    const lineHeight = 9;
    doc.setFontSize(8);

    const leftDetails = [
        ['Name:', formData.student_name],
        ["Father's Name:", formData.father_name],
        ["Mother's Name:", formData.mother_name],
        ['DOB (dd/mm/yy):', formData.dob],
        ['Gender:', formData.gender]
    ];
    const rightDetails = [
        ['Class/Grade:', formData.class_grade],
        ['Subject/Course:', formData.subject_course],
        ['Mobile Number:', formData.mobile],
        ['Email Address:', formData.email],
        ['Submission Date:', formData.submission_date]
    ];

    leftDetails.forEach((d, i) => {
        const y = currentY + i * lineHeight;
        doc.setFont(undefined, 'bold'); doc.text(d[0], leftCol, y);
        doc.setFont(undefined, 'bolditalic'); doc.text(d[1], leftCol + 30, y);
    });

    rightDetails.forEach((d, i) => {
        const y = currentY + i * lineHeight;
        doc.setFont(undefined, 'bold'); doc.text(d[0], rightCol, y);
        doc.setFont(undefined, 'bolditalic'); doc.text(d[1], rightCol + 30, y);
    });

    currentY += leftDetails.length * lineHeight + 12;

    doc.setFont(undefined, 'bold');
    doc.text('Address:', margin, currentY);
    doc.setFont(undefined, 'normal');
    const addrLines = doc.splitTextToSize(formData.address || 'N/A', contentWidth - 35);
    doc.text(addrLines, margin + 30, currentY);
    currentY += addrLines.length * 7 + 5;

    let sigY = currentY + 10;
    if (sigY > maxSigY) sigY = maxSigY;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin, sigY, 50, 15);
    doc.rect(margin + 70, sigY, 50, 15);
    doc.rect(margin + 140, sigY, 45, 15);
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Parent Signature', margin + 25, sigY + 12, { align: 'center' });
    doc.text('Student Signature', margin + 95, sigY + 12, { align: 'center' });
    doc.text('Teacher Signature', margin + 162, sigY + 12, { align: 'center' });

    doc.setFontSize(9);
    doc.text('Mr. Mohammed S.R', margin, sigY + 25);
    doc.setFont(undefined, 'normal');
    doc.text('Founder/Director', margin, sigY + 30);
    doc.setFont(undefined, 'bold');
    doc.text(`Admission Date: ${formData.submission_date}`, rightCol, sigY + 25);

    // Footer
    doc.setFillColor(0, 119, 182);
    doc.rect(margin, footerY, contentWidth, footerHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.text('IMPORTANT: Submit this signed letter with academic records to complete admission', pageWidth / 2, footerY + 8, { align: 'center' });
    doc.setFontSize(6);
    doc.setFont(undefined, 'normal');
    doc.text('Address: In front of Police Station, Above Dattkrupa Medical, Dharmabad, District Nanded', pageWidth / 2, footerY + 16, { align: 'center' });
    doc.text('Contact: Mr. Mohammad Sultan - 9325642243', pageWidth / 2, footerY + 24, { align: 'center' });

    // ⬇️ Wait for stamp to load before saving
    addStampImage(doc, pageWidth / 2, pageHeight / 2, () => {
        window.generatedPDF = doc;
        downloadPDF();
    });
}

function showPhotoPlaceholder(doc, x, y) {
    doc.setFillColor(248, 250, 252);
    doc.rect(x + 2, y + 2, 31, 41, 'F');
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('📷', x + 17, y + 12, { align: 'center' });
    doc.text('PASTE', x + 17, y + 18, { align: 'center' });
    doc.text('PHOTO', x + 17, y + 26, { align: 'center' });
    doc.text('HERE', x + 17, y + 34, { align: 'center' });
}

function addStampImage(doc, x, y, callback) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.globalAlpha = 0.3;
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        doc.addImage(dataURL, 'PNG', x - 20, y - 20, 40, 40);
        if (callback) callback();
    };
    img.onerror = () => {
        addTextStamp(doc, x, y);
        if (callback) callback();
    };
    img.src = 'stamp.png'; // Ensure this image exists in the correct folder
}

function addTextStamp(doc, x, y) {
    doc.setLineWidth(1);
    doc.setLineDashPattern([2, 2]);
    doc.circle(x, y, 20);
    doc.setLineDashPattern([]);
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.text('STAMP', x, y + 2, { align: 'center' });
    doc.text('HERE', x, y + 8, { align: 'center' });
}

function downloadPDF() {
    if (!window.generatedPDF) {
        alert('PDF not ready. Submit the form first.');
        return;
    }

    try {
        const filename = `admission-confirmation-${formData.student_name.replace(/\s+/g, '_')}.pdf`;
        window.generatedPDF.save(filename);
    } catch (err) {
        console.error('Error downloading PDF:', err);
        alert('Could not download. Try again.');
    }
}
