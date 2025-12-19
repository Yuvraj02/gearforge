import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizerName,
      organizationType,
      pocName,
      organizationEmail,
      pocEmail,
      location,
      contactInfo,
      message
    } = body;

    // Validate required fields
    if (!organizerName || !organizationType || !pocName || !pocEmail || !location || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email to gearforge.india@gmail.com
    const emailPayload = {
      to: 'gearforge.india@gmail.com',
      subject: `New Organizer Application: ${organizerName}`,
      html: `
        <h2>New Organizer Application Submission</h2>
        <p><strong>Organization Name:</strong> ${organizerName}</p>
        <p><strong>Organization Type:</strong> ${organizationType}</p>
        <p><strong>Point of Contact Name:</strong> ${pocName}</p>
        <p><strong>Organization Email:</strong> ${organizationEmail || 'Not provided'}</p>
        <p><strong>POC Email:</strong> ${pocEmail}</p>
        <p><strong>Phone Number:</strong> ${contactInfo || 'Not provided'}</p>
        <p><strong>Location:</strong> ${location}</p>
        <h3>About Organization & Tournament Plans:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // TODO: EMAIL SERVICE INTEGRATION

    console.log('Organizer application submission:', emailPayload);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Application submitted successfully! We will review and contact you within 3-5 business days.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing organizer application:', error);
    return NextResponse.json(
      { error: 'Failed to process your application' },
      { status: 500 }
    );
  }
}
