const Tesseract = require('tesseract.js');
const fs = require('fs');

const extractPAN = (ocrText) => {
   const cleanedText = ocrText
      .replace(/\n/g, " ")
      .replace(/\r/g, " ")
      .replace(/\s+/g, "")
      .toUpperCase();

   console.log(
      "CLEANED OCR:",
      cleanedText
   );

   const panRegex =
      /[A-Z]{5}[0-9]{4}[A-Z]/;

   const match =
      cleanedText.match(panRegex);

   if(!match){
      return null;
   }

   return match[0];
};

const extractPANDetails = async (imagePath) => {
  console.log('[OCR] Processing image:', imagePath);

  const { data: { text } } = await Tesseract.recognize(
    imagePath,
    'eng',
    { logger: m => console.log('[OCR Progress]', m.status) }
  );

  const extractedPAN = extractPAN(text);

  return {
    extractedPAN,
    rawText: text
  };
};

const compareNames = (ocrName, aadhaarName) => {
  if (!ocrName || !aadhaarName) return false;

  const ocrFirst = ocrName.toUpperCase().trim().split(' ')[0];
  const aadhaarFirst = aadhaarName.toUpperCase().trim().split(' ')[0];

  console.log('[OCR] Comparing names:');
  console.log('  OCR first name:', ocrFirst);
  console.log('  Aadhaar first name:', aadhaarFirst);

  return ocrFirst === aadhaarFirst;
};

const extractGSTINFromCertificate = async (filePath) => {
  console.log('[OCR GST] Processing file:', filePath);

  // If the file is a PDF, extract text using pdf-parse instead of Tesseract to prevent crash
  if (filePath.toLowerCase().endsWith('.pdf')) {
    console.log('[OCR GST] File is PDF. Attempting text extraction via pdf-parse...');
    try {
      const { PDFParse } = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const data = await parser.getText();
      const text = data.text || '';

      const cleanedText = text
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .toUpperCase()
        .trim();

      console.log('[OCR GST PDF] Cleaned text:', cleanedText);

      const gstinRegex = /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/g;
      const gstinMatches = cleanedText.match(gstinRegex);
      const extractedGSTIN = gstinMatches ? gstinMatches[0] : null;

      if (!extractedGSTIN) {
        throw new Error('No GSTIN detected in PDF text. If this is a scanned certificate, please upload it as a PNG or JPEG image instead.');
      }

      console.log('[OCR GST] Extracted GSTIN from PDF:', extractedGSTIN);
      return {
        extractedGSTIN,
        rawText: text
      };
    } catch (pdfErr) {
      console.error('[OCR GST PDF Error]:', pdfErr.message);
      throw new Error(pdfErr.message.includes('No GSTIN') ? pdfErr.message : 'Failed to parse PDF document. Please upload a clear PNG or JPEG image instead.');
    }
  }

  // Otherwise, run Tesseract on the image
  try {
    const { data: { text } } = await Tesseract.recognize(
      filePath,
      'eng',
      { logger: m => console.log('[OCR GST Progress]', m.status) }
    );

    console.log('[OCR GST] Raw text:', text);

    const cleanedText = text
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .toUpperCase()
      .trim();

    console.log('[OCR GST] Cleaned text:', cleanedText);

    // Extract GSTIN
    const gstinRegex = /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/g;
    const gstinMatches = cleanedText.match(gstinRegex);

    // Take first valid match
    const extractedGSTIN = gstinMatches ? gstinMatches[0] : null;

    console.log('[OCR GST] Extracted GSTIN:', extractedGSTIN);

    return {
      extractedGSTIN,
      rawText: text
    };
  } catch (ocrErr) {
    console.error('[OCR GST Image Error]:', ocrErr.message);
    throw new Error('Failed to run OCR on image. Please upload a clearer image of your GST certificate.');
  }
};

const extractPANFromGSTIN = (gstin) => {
  if (!gstin || gstin.length < 12) return null;
  // GSTIN positions 2-11 (0 indexed) = PAN
  // Example: 29ABCDE1234F1Z5
  //            ^^^^^^^^^^
  //            index 2 to 11
  return gstin.substring(2, 12).toUpperCase();
};

module.exports = {
  extractPAN,
  extractPANDetails,
  compareNames,
  extractGSTINFromCertificate,
  extractPANFromGSTIN
};
