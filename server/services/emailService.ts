interface BookingDetails {
  userName: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
}

interface PriorityRequestDetails {
  requesterName: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export async function sendBookingConfirmation(email: string, details: BookingDetails): Promise<void> {
  try {
    // In a real implementation, this would use nodemailer or similar service
    // For now, we'll log the email content
    console.log(`
      EMAIL SENT TO: ${email}
      SUBJECT: Room Booking Confirmation - ${details.roomName}
      
      Dear ${details.userName},
      
      Your room booking has been confirmed!
      
      Details:
      - Room: ${details.roomName}
      - Date: ${details.date}
      - Time: ${details.startTime} - ${details.endTime}
      - Purpose: ${details.purpose}
      
      Thank you for using Kofuku Room Booking System.
      
      Best regards,
      Kofuku Technologies
    `);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
  }
}

export async function sendPriorityRequest(email: string, details: PriorityRequestDetails): Promise<void> {
  try {
    // In a real implementation, this would use nodemailer or similar service
    // For now, we'll log the email content
    console.log(`
      EMAIL SENT TO: ${email}
      SUBJECT: Priority Room Access Request - ${details.roomName}
      
      A priority access request has been made for your room booking.
      
      Request Details:
      - Requester: ${details.requesterName}
      - Room: ${details.roomName}
      - Date: ${details.date}
      - Time: ${details.startTime} - ${details.endTime}
      - Reason: ${details.reason}
      
      Please review this request and respond accordingly.
      
      Best regards,
      Kofuku Technologies
    `);
  } catch (error) {
    console.error("Error sending priority request email:", error);
  }
}
