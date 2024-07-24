
const User = require('../Models/userModel')
const PDFDocument = require('pdfkit')
const fs = require('fs')


const formatDate = (date) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };

    const formattedDate = new Date(date).toLocaleDateString('en-US', options);

    return `${formattedDate}`;
}


const createPDF = async (paymentsMap , eventId , expPerMember , amountMap) => {


    const senderIds = Object.keys(paymentsMap);
    const memberNamesPromises = senderIds.map(async senderId => {
        const user = await User.findById(senderId);
        const name = user.name;
        return { senderId, name };
    });
    const members = await Promise.all(memberNamesPromises);
    members.sort((a, b) => a.name.localeCompare(b.name));

    const sortedSenderIds = members.map(member => member.senderId);
    const sortedNames = members.map(member => member.name);
    
    const pdfDoc = new PDFDocument();
    const fileName = `event_${eventId}_payments.pdf`;
    const filePath = `../src/UploadedDocs/${fileName}`;
    pdfDoc.pipe(fs.createWriteStream(filePath));

    pdfDoc.fontSize(16);
    pdfDoc.font('Helvetica-Bold').text(`Expenditure Details` , { underline: true , align: 'center' });
    pdfDoc.moveDown()
    pdfDoc.fontSize(12);
    pdfDoc.font('Helvetica').text(`Total Expense Per Member = ${expPerMember.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}`)
    pdfDoc.moveDown()
    pdfDoc.moveDown()

    for (let i = 0; i < sortedNames.length; i++) {
        const senderId = sortedSenderIds[i];
        const memberName = sortedNames[i];
        const payments = paymentsMap[senderId];
        const totalAmount = amountMap[senderId].reduce((acc, curr) => acc + curr, 0);
        pdfDoc.fontSize(12);
        pdfDoc.font('Helvetica-Bold').text(`${memberName}`, { continued: true });
        pdfDoc.font('Helvetica-Bold').text(':-', {continued: true}); 
        pdfDoc.fontSize(10);
        pdfDoc.font('Helvetica-Bold').text(`Total Expense:    ${totalAmount.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}`, { align: 'right' }); 
        pdfDoc.fontSize(10);
        pdfDoc.moveDown()
        for(const payment of payments) {
            pdfDoc.font('Helvetica').text('                Date:  ' , { continued: true })
            pdfDoc.font('Helvetica').text(`${formatDate(payment.date)}` , { align: 'right' })
            pdfDoc.font('Helvetica').text(`                Amount:  `, { continued: true });
            pdfDoc.font('Helvetica-Bold').text(`${payment.amount.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}` , { align: 'right' })
            pdfDoc.font('Helvetica').text(`                Place of Expense: `, { continued: true })
            pdfDoc.font('Helvetica').text(`${payment.place}` , { align: 'right' })
            pdfDoc.moveDown()
        }
        pdfDoc.moveDown()
        pdfDoc.moveDown()
    }

    pdfDoc.end();
}


module.exports = createPDF


