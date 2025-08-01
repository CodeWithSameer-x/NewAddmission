// Global variables
let uploadedPhotoData = null;
let formData = {};

// Form submission handler
document.getElementById('admissionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('Form submitted successfully, generating PDF...');
    
    // Get form data
    const form = e.target;
    formData = {
        student_name: form.student_name.value,
        father_name: form.father_name.value,
        mother_name: form.mother_name.value,
        dob: form.dob.value,
        gender: form.gender.value,
        class_grade: form.class_grade.value,
        subject_course: form.subject_course.value,
        mobile: form.mobile.value,
        email: form.email.value,
        address: form.address.value,
        submission_date: new Date().toLocaleDateString('en-GB')
    };
    
    // Show success message
    document.getElementById('success-message').style.display = 'block';
    
    // Generate PDF
    generatePDF();
    
    // Send notification (optional - replace with your Formspree endpoint)
    try {
        await fetch('https://formspree.io/f/your-form-id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
    } catch (error) {
        console.log('Notification service not configured');
    }
});

// Photo upload handling
document.getElementById('student-photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        handlePhotoUpload(file);
    }
});

// Camera button functionality
document.getElementById('camera-btn').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            handlePhotoUpload(file);
        }
    };
    input.click();
});

function handlePhotoUpload(file) {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedPhotoData = e.target.result;
        showPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

function showPhotoPreview(imageSrc) {
    const preview = document.getElementById('photo-preview');
    preview.innerHTML = `<img src="${imageSrc}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
}

// Download PDF handler
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'download-pdf') {
            downloadPDF();
        }
    });
});

// Generate PDF confirmation letter
function generatePDF() {
    console.log('Starting PDF generation...');
    
    // Check if jsPDF is loaded
    if (!window.jspdf) {
        console.error('jsPDF not loaded');
        alert('PDF library not loaded. Please refresh the page and try again.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    console.log('jsPDF initialized');
    
    // Set up document properties
    doc.setProperties({
        title: 'Admission Confirmation Letter - Vision Institute of Science',
        author: 'Vision Institute of Science',
        creator: 'Vision Institute of Science Admission System'
    });
    
    // Add elegant border
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277);
    
    // Inner decorative border
    doc.setLineWidth(0.5);
    doc.setDrawColor(100, 100, 100);
    doc.rect(12, 12, 186, 273);
    
    // Header background with gradient effect
    doc.setFillColor(30, 58, 138);
    doc.rect(15, 15, 180, 35, 'F');
    
    // Header decorative elements
    doc.setFillColor(59, 130, 246);
    doc.rect(15, 15, 180, 8, 'F');
    
    // Institution name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('VISION INSTITUTE OF SCIENCE', 105, 32, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'italic');
    doc.text('Learn with Confidence', 105, 40, { align: 'center' });
    
    // Decorative line under header
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(2);
    doc.line(15, 45, 195, 45);
    
    // Add photo section with better styling
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(2);
    doc.rect(148, 55, 35, 45);
    
    if (uploadedPhotoData) {
        try {
            doc.addImage(uploadedPhotoData, 'JPEG', 150, 57, 31, 41);
        } catch (error) {
            console.log('Error adding photo to PDF:', error);
            showPhotoPlaceholder(doc);
        }
    } else {
        showPhotoPlaceholder(doc);
    }
    
    // Title section with decorative background
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 110, 170, 15, 'F');
    
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('ADMISSION CONFIRMATION LETTER', 105, 120, { align: 'center' });
    
    // Student Information Section with better formatting
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Student Information:', 25, 140);
    
    // Create information table
    let yPos = 150;
    const leftCol = 25;
    const rightCol = 110;
    const lineHeight = 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const leftDetails = [
        { label: 'Name:', value: formData.student_name },
        { label: 'Father\'s Name:', value: formData.father_name },
        { label: 'Mother\'s Name:', value: formData.mother_name },
        { label: 'Date of Birth:', value: formData.dob },
        { label: 'Gender:', value: formData.gender }
    ];
    
    const rightDetails = [
        { label: 'Class/Grade:', value: formData.class_grade },
        { label: 'Subject/Course:', value: formData.subject_course },
        { label: 'Mobile Number:', value: formData.mobile },
        { label: 'Email Address:', value: formData.email },
        { label: 'Address:', value: formData.address }
    ];
    
    // Left column
    leftDetails.forEach((detail, index) => {
        doc.setFont(undefined, 'bold');
        doc.text(detail.label, leftCol, yPos + (index * lineHeight));
        doc.setFont(undefined, 'normal');
        doc.text(detail.value, leftCol + 25, yPos + (index * lineHeight));
    });
    
    // Right column
    rightDetails.forEach((detail, index) => {
        doc.setFont(undefined, 'bold');
        doc.text(detail.label, rightCol, yPos + (index * lineHeight));
        doc.setFont(undefined, 'normal');
        doc.text(detail.value, rightCol + 25, yPos + (index * lineHeight));
    });
    
    // Add stamp.png image (you will add stamp.png file)
    addStampImage(doc, 105, 210);
    
    // Signature section with improved layout
    const sigY = 240;
    
    // Signature boxes
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(25, sigY, 50, 15);
    doc.rect(85, sigY, 50, 15);
    doc.rect(145, sigY, 45, 15);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Parent Signature', 50, sigY - 2, { align: 'center' });
    doc.text('Student Signature', 110, sigY - 2, { align: 'center' });
    doc.text('Teacher Signature', 167, sigY - 2, { align: 'center' });
    
    // Authority section
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Mr. Mohammed S.R', 25, sigY + 25);
    doc.setFont(undefined, 'normal');
    doc.text('Principal/Director', 25, sigY + 30);
    
    // Admission date
    doc.setFont(undefined, 'bold');
    doc.text(`Admission Date: ${formData.submission_date}`, 110, sigY + 25);
    
    // Footer with improved styling
    doc.setFillColor(0, 184, 217);
    doc.rect(15, 270, 180, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('IMPORTANT: Submit this signed letter with academic records to complete admission', 105, 278, { align: 'center' });
    
    // Store PDF for download
    window.generatedPDF = doc;
    console.log('PDF generation completed and stored');
}

// Add stamp image to PDF
function addStampImage(doc, x, y) {
    try {
        // Try to load and add the stamp.png image
        const img = new Image();
        img.onload = function() {
            try {
                // Convert image to base64 and add to PDF
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                
                // Add image to PDF (stamp size: 40x40)
                doc.addImage(dataURL, 'PNG', x - 20, y - 20, 40, 40);
                
                // Update the stored PDF
                window.generatedPDF = doc;
            } catch (error) {
                console.log('Error adding stamp image:', error);
                // Fallback to placeholder if image fails
                addTextStamp(doc, x, y);
            }
        };
        
        img.onerror = function() {
            console.log('stamp.png not found, using placeholder');
            // Fallback to placeholder if image not found
            addTextStamp(doc, x, y);
        };
        
        // Try to load stamp.png
        img.src = 'stamp.png';
        
    } catch (error) {
        console.log('Error loading stamp image:', error);
        // Fallback to placeholder
        addTextStamp(doc, x, y);
    }
}

// Fallback if stamp.png image not available - leaves empty space for manual stamp
function addTextStamp(doc, x, y) {
    // Just add a placeholder box for stamp - no generated text
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(x - 30, y - 20, 60, 40);
    doc.setLineDashPattern([], 0);
    
    // Add text indication
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('STAMP HERE', x - 12, y);
}

// Show photo placeholder in PDF
function showPhotoPlaceholder(doc) {
    // Background for placeholder
    doc.setFillColor(248, 250, 252);
    doc.rect(150, 57, 31, 41, 'F');
    
    // Add "Paste Photo Here" text with better styling
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('PASTE', 165, 72, { align: 'center' });
    doc.text('PHOTO', 165, 80, { align: 'center' });
    doc.text('HERE', 165, 88, { align: 'center' });
    
    // Add small camera icon using text
    doc.setFontSize(12);
    doc.text('📷', 165, 65, { align: 'center' });
}

// Download PDF function
function downloadPDF() {
    console.log('Download button clicked');
    
    if (!window.generatedPDF) {
        alert('PDF not generated yet. Please try again.');
        return;
    }
    
    try {
        const filename = `admission-confirmation-${formData.student_name.replace(/\s+/g, '_')}.pdf`;
        console.log('Downloading PDF:', filename);
        window.generatedPDF.save(filename);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Error downloading PDF. Please try again.');
    }
}
