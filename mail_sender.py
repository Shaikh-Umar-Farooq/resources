import pandas as pd
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    filename=f'email_sender_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def process_full_name(full_name):
    """Extract just the first word from the full name."""
    try:
        first_word = str(full_name).split()[0]
        return first_word.strip()
    except:
        return "Valued Customer"

def send_email(sender_email, sender_password, recipient, subject, body):
    """Send email with error handling."""
    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))  # Changed to HTML for better formatting
        
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
            
        return True
    except Exception as e:
        logging.error(f"Failed to send email to {recipient}: {str(e)}")
        return False

def main():
    # Email configuration
    SENDER_EMAIL = "smuf7080@gmail.com"
    SENDER_PASSWORD = "hlii uoqm tpjb zzjo"
    SUBJECT = "Free Structured UI/UX Learning Platform - Helping Aspiring Designers"
    
    # Email template with HTML formatting
    EMAIL_TEMPLATE = """
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <p>Hi {name},</p>

    <p>I'm Umar Shaikh, a self-taught UI/UX designer. I've created a completely free, comprehensive UI/UX learning platform at <a href="https://learnuiux.vercel.app">learnuiux.vercel.app</a> that curates the best YouTube tutorials and articles in a structured, progressive learning path.</p>

    <p><strong>Why this platform exists:</strong><br>
    When I started learning UI/UX design, I couldn't afford paid courses and spent countless hours searching for quality free content. I've transformed that challenge into a solution - a carefully organized platform that guides learners from basics to advanced concepts, with built-in progress tracking.</p>

    <p><strong>What makes it different:</strong></p>
    <ul>
        <li>100% free forever, no hidden charges</li>
        <li>No ads or data collection</li>
        <li>Structured chapter-by-chapter learning path</li>
        <li>Progress tracking system</li>
        <li>No mandatory email verification (users can stay anonymous)</li>
        <li>Curated content from trusted sources</li>
    </ul>

    <p><strong>Would you consider sharing this resource with your audience?</strong> Your support could help countless aspiring designers who face financial barriers in accessing UI/UX education. This is <strong>purely a social initiative</strong> to make design education accessible to everyone.</p>

    <p>Thank you for considering this request. Together, we can help democratize UI/UX design education.</p>

    <p>Best regards,<br>
    Umar Shaikh</p>
    </body>
    </html>
    """
    
    try:
        # Read Excel file
        df = pd.read_excel('ui ux insta influencers1.xlsx')
        
        # Verify required columns exist
        required_columns = ['Public email', 'Full name']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")
        
        successful = 0
        failed = 0
        
        for index, row in df.iterrows():
            email = row['Public email']
            full_name = row['Full name']
            
            # Skip if email is empty
            if pd.isna(email):
                logging.warning(f"Empty email found at row {index + 2}")
                continue
            
            # Process name
            name = process_full_name(full_name) if not pd.isna(full_name) else "Valued Customer"
            
            # Prepare and send email
            personalized_body = EMAIL_TEMPLATE.format(name=name)
            
            logging.info(f"Attempting to send email to: {email} ({name})")
            if send_email(SENDER_EMAIL, SENDER_PASSWORD, email, SUBJECT, personalized_body):
                successful += 1
                logging.info(f"Successfully sent email to: {email} ({name})")
            else:
                failed += 1
            
            time.sleep(20)
        
        # Log final statistics
        logging.info(f"Email sending completed. Successful: {successful}, Failed: {failed}")
        print(f"Process completed. Check the log file for details.")
        print(f"Successful emails: {successful}")
        print(f"Failed emails: {failed}")
            
    except Exception as e:
        logging.error(f"Script execution failed: {str(e)}")
        print(f"An error occurred. Check the log file for details.")

if __name__ == "__main__":
    main()