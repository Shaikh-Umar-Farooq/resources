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
    """Extract first two words from the full name."""
    try:
        # Split the name by spaces and take first two words
        name_parts = str(full_name).split()
        processed_name = ' '.join(name_parts[:2])
        return processed_name.strip()
    except:
        return "Valued Customer"

def send_email(sender_email, sender_password, recipient, subject, body):
    """Send email with error handling."""
    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
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
    SENDER_EMAIL = "smuf7080@gmail.com"  # Replace with your email
    SENDER_PASSWORD = "hlii uoqm tpjb zzjo"   # Replace with your app password
    SUBJECT = "Your Subject Line"
    
    # Email template
    EMAIL_TEMPLATE = """
    Dear {name},
    
    I hope this email finds you well.
    
    [Your email content here]
    
    Best regards,
    [Your Name]
    """
    
    try:
        # Read Excel file
        df = pd.read_excel('clients.xlsx')  # Replace with your Excel file
        
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